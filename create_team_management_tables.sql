-- Team Management and User Invitation System
-- Creates tables and policies for managing team members and invitations

-- Create user_invitations table
CREATE TABLE IF NOT EXISTS user_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'staff',
  app_access TEXT[] DEFAULT '{}',
  invited_by UUID REFERENCES user_profiles(id),
  invitation_token UUID DEFAULT gen_random_uuid(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE NULL,
  custom_message TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_invitations_organization_id ON user_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_invitations_email ON user_invitations(email);
CREATE INDEX IF NOT EXISTS idx_user_invitations_token ON user_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_user_invitations_status ON user_invitations(status);

-- Add app_access column to user_profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'app_access'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN app_access TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- Add status column to user_profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending'));
  END IF;
END $$;

-- Add invited_by column to user_profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'invited_by'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN invited_by UUID REFERENCES user_profiles(id);
  END IF;
END $$;

-- Create custom permissions table for granular access control
CREATE TABLE IF NOT EXISTS user_custom_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  app_id VARCHAR(50) NOT NULL,
  permission_type VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  granted_by UUID REFERENCES user_profiles(id),
  expires_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for custom permissions
CREATE INDEX IF NOT EXISTS idx_user_custom_permissions_user_id ON user_custom_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_custom_permissions_organization_id ON user_custom_permissions(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_custom_permissions_app_id ON user_custom_permissions(app_id);

-- Enable RLS on new tables
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_custom_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_invitations
-- Allow users to view invitations for their organization
DROP POLICY IF EXISTS "Users can view invitations for their organization" ON user_invitations;
CREATE POLICY "Users can view invitations for their organization" ON user_invitations
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

-- Allow managers and owners to create invitations
DROP POLICY IF EXISTS "Managers can create invitations" ON user_invitations;
CREATE POLICY "Managers can create invitations" ON user_invitations
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('owner', 'manager')
    )
  );

-- Allow managers and owners to update invitations
DROP POLICY IF EXISTS "Managers can update invitations" ON user_invitations;
CREATE POLICY "Managers can update invitations" ON user_invitations
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('owner', 'manager')
    )
  );

-- Allow managers and owners to delete invitations
DROP POLICY IF EXISTS "Managers can delete invitations" ON user_invitations;
CREATE POLICY "Managers can delete invitations" ON user_invitations
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('owner', 'manager')
    )
  );

-- RLS Policies for user_custom_permissions
-- Allow users to view custom permissions for their organization
DROP POLICY IF EXISTS "Users can view custom permissions for their organization" ON user_custom_permissions;
CREATE POLICY "Users can view custom permissions for their organization" ON user_custom_permissions
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

-- Allow managers and owners to manage custom permissions
DROP POLICY IF EXISTS "Managers can manage custom permissions" ON user_custom_permissions;
CREATE POLICY "Managers can manage custom permissions" ON user_custom_permissions
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('owner', 'manager')
    )
  );

-- Create function to automatically expire invitations
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS void AS $$
BEGIN
  UPDATE user_invitations 
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'pending' 
  AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to tables
DROP TRIGGER IF EXISTS update_user_invitations_updated_at ON user_invitations;
CREATE TRIGGER update_user_invitations_updated_at
  BEFORE UPDATE ON user_invitations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_custom_permissions_updated_at ON user_custom_permissions;
CREATE TRIGGER update_user_custom_permissions_updated_at
  BEFORE UPDATE ON user_custom_permissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON user_invitations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_custom_permissions TO authenticated;

-- Create function to accept invitation and create user profile
CREATE OR REPLACE FUNCTION accept_invitation(invitation_token_param UUID, user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  invitation_row user_invitations%ROWTYPE;
BEGIN
  -- Get the invitation
  SELECT * INTO invitation_row
  FROM user_invitations
  WHERE invitation_token = invitation_token_param
  AND status = 'pending'
  AND expires_at > NOW();
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Create or update user profile
  INSERT INTO user_profiles (
    id, 
    organization_id, 
    email, 
    role, 
    app_access, 
    invited_by,
    status,
    created_at, 
    updated_at
  ) VALUES (
    user_id_param,
    invitation_row.organization_id,
    invitation_row.email,
    invitation_row.role,
    invitation_row.app_access,
    invitation_row.invited_by,
    'active',
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    organization_id = invitation_row.organization_id,
    role = invitation_row.role,
    app_access = invitation_row.app_access,
    invited_by = invitation_row.invited_by,
    status = 'active',
    updated_at = NOW();
  
  -- Mark invitation as accepted
  UPDATE user_invitations
  SET status = 'accepted', accepted_at = NOW(), updated_at = NOW()
  WHERE id = invitation_row.id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION accept_invitation(UUID, UUID) TO authenticated;

COMMENT ON TABLE user_invitations IS 'Stores team member invitations with role and app access specifications';
COMMENT ON TABLE user_custom_permissions IS 'Stores custom permissions that override default role permissions';
COMMENT ON FUNCTION accept_invitation(UUID, UUID) IS 'Processes invitation acceptance and creates/updates user profile';
COMMENT ON FUNCTION expire_old_invitations() IS 'Marks expired invitations as expired status';

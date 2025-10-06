-- Add foreign key constraint for organization_id
ALTER TABLE email_captures
  ADD CONSTRAINT fk_email_captures_organization
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL;

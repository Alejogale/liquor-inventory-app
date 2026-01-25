import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Users,
  UserPlus,
  Crown,
  Shield,
  User,
  Eye,
  Mail,
  Clock,
  MoreVertical,
  X,
  Check,
  ChevronDown,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { supabase, useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/common';
import { colors, typography, spacing, radius } from '../../constants/theme';

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  role: 'owner' | 'manager' | 'staff' | 'viewer';
  status: string;
  created_at: string;
}

interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  status: string;
  expires_at: string;
  created_at: string;
}

const ROLES = [
  { value: 'manager', label: 'Manager', description: 'Full access, can manage team' },
  { value: 'staff', label: 'Staff', description: 'Can count and add items' },
  { value: 'viewer', label: 'Viewer', description: 'View only access' },
];

export const TeamManagement: React.FC = () => {
  const navigation = useNavigation<any>();
  const { userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);

  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<string>('staff');
  const [inviteMessage, setInviteMessage] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [showRolePicker, setShowRolePicker] = useState(false);

  // Member actions
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showMemberActions, setShowMemberActions] = useState(false);
  const [showRoleChangeModal, setShowRoleChangeModal] = useState(false);
  const [newRole, setNewRole] = useState<string>('');

  const isOwner = userProfile?.role === 'owner';
  const isManager = userProfile?.role === 'manager';
  const canManageTeam = isOwner || isManager;

  const fetchTeamData = useCallback(async () => {
    if (!userProfile?.organization_id) return;

    try {
      // Fetch team members
      const { data: members, error: membersError } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, role, status, created_at')
        .eq('organization_id', userProfile.organization_id)
        .order('role')
        .order('full_name');

      if (membersError) throw membersError;
      setTeamMembers(members || []);

      // Fetch pending invitations
      const { data: invitations, error: invitationsError } = await supabase
        .from('user_invitations')
        .select('id, email, role, status, expires_at, created_at')
        .eq('organization_id', userProfile.organization_id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (invitationsError) throw invitationsError;
      setPendingInvitations(invitations || []);

    } catch (error) {
      console.error('Error fetching team data:', error);
      Alert.alert('Error', 'Failed to load team data.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [userProfile?.organization_id]);

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchTeamData();
  }, [fetchTeamData]);

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  }, [navigation]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown size={16} color={colors.warning} />;
      case 'manager':
        return <Shield size={16} color={colors.primary} />;
      case 'staff':
        return <User size={16} color={colors.info} />;
      case 'viewer':
        return <Eye size={16} color={colors.textTertiary} />;
      default:
        return <User size={16} color={colors.textTertiary} />;
    }
  };

  const getRoleLabel = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      Alert.alert('Error', 'Please enter an email address.');
      return;
    }

    if (!inviteEmail.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    // Check if already a team member
    const existingMember = teamMembers.find(
      m => m.email.toLowerCase() === inviteEmail.toLowerCase()
    );
    if (existingMember) {
      Alert.alert('Error', 'This person is already a team member.');
      return;
    }

    // Check if already invited
    const existingInvite = pendingInvitations.find(
      i => i.email.toLowerCase() === inviteEmail.toLowerCase()
    );
    if (existingInvite) {
      Alert.alert('Error', 'An invitation has already been sent to this email.');
      return;
    }

    try {
      setIsInviting(true);

      // Create invitation (expires in 7 days)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { error } = await supabase
        .from('user_invitations')
        .insert({
          organization_id: userProfile?.organization_id,
          email: inviteEmail.toLowerCase().trim(),
          role: inviteRole,
          invited_by: userProfile?.id,
          expires_at: expiresAt.toISOString(),
          custom_message: inviteMessage.trim() || null,
          status: 'pending',
        });

      if (error) throw error;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Invitation Sent',
        `An invitation has been sent to ${inviteEmail}. They will receive an email with instructions to join your team.`
      );

      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole('staff');
      setInviteMessage('');
      fetchTeamData();

    } catch (error) {
      console.error('Error sending invitation:', error);
      Alert.alert('Error', 'Failed to send invitation. Please try again.');
    } finally {
      setIsInviting(false);
    }
  };

  const handleCancelInvitation = async (invitation: PendingInvitation) => {
    Alert.alert(
      'Cancel Invitation',
      `Cancel the invitation to ${invitation.email}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('user_invitations')
                .update({ status: 'cancelled' })
                .eq('id', invitation.id);

              if (error) throw error;

              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              fetchTeamData();
            } catch (error) {
              console.error('Error cancelling invitation:', error);
              Alert.alert('Error', 'Failed to cancel invitation.');
            }
          },
        },
      ]
    );
  };

  const handleMemberPress = (member: TeamMember) => {
    if (!canManageTeam) return;
    if (member.id === userProfile?.id) return; // Can't manage yourself
    if (member.role === 'owner' && !isOwner) return; // Only owner can manage other owners

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMember(member);
    setShowMemberActions(true);
  };

  const handleChangeRole = async () => {
    if (!selectedMember || !newRole) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', selectedMember.id);

      if (error) throw error;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowRoleChangeModal(false);
      setShowMemberActions(false);
      setSelectedMember(null);
      setNewRole('');
      fetchTeamData();
    } catch (error) {
      console.error('Error changing role:', error);
      Alert.alert('Error', 'Failed to change role.');
    }
  };

  const handleRemoveMember = () => {
    if (!selectedMember) return;

    Alert.alert(
      'Remove Team Member',
      `Are you sure you want to remove ${selectedMember.full_name} from the team? They will lose access to all apps.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              // Update user profile to remove from organization
              const { error } = await supabase
                .from('user_profiles')
                .update({
                  organization_id: null,
                  status: 'inactive'
                })
                .eq('id', selectedMember.id);

              if (error) throw error;

              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              setShowMemberActions(false);
              setSelectedMember(null);
              fetchTeamData();
            } catch (error) {
              console.error('Error removing member:', error);
              Alert.alert('Error', 'Failed to remove team member.');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner variant="branded" message="Loading team..." />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Team</Text>
        {canManageTeam && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setShowInviteModal(true);
            }}
          >
            <UserPlus size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
        {!canManageTeam && <View style={styles.placeholder} />}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Team Members */}
        <Text style={styles.sectionTitle}>
          Team Members ({teamMembers.length})
        </Text>
        <View style={styles.listCard}>
          {teamMembers.map((member, index) => (
            <TouchableOpacity
              key={member.id}
              style={[
                styles.memberItem,
                index === teamMembers.length - 1 && styles.memberItemLast,
              ]}
              onPress={() => handleMemberPress(member)}
              disabled={!canManageTeam || member.id === userProfile?.id}
              activeOpacity={canManageTeam && member.id !== userProfile?.id ? 0.7 : 1}
            >
              <View style={styles.memberAvatar}>
                <Text style={styles.memberAvatarText}>
                  {member.full_name?.charAt(0) || 'U'}
                </Text>
              </View>
              <View style={styles.memberInfo}>
                <View style={styles.memberNameRow}>
                  <Text style={styles.memberName}>
                    {member.full_name}
                    {member.id === userProfile?.id && ' (You)'}
                  </Text>
                  {getRoleIcon(member.role)}
                </View>
                <Text style={styles.memberEmail}>{member.email}</Text>
                <View style={styles.memberMeta}>
                  <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(member.role) }]}>
                    <Text style={styles.roleBadgeText}>{getRoleLabel(member.role)}</Text>
                  </View>
                </View>
              </View>
              {canManageTeam && member.id !== userProfile?.id && member.role !== 'owner' && (
                <MoreVertical size={20} color={colors.textTertiary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Pending Invitations */}
        {pendingInvitations.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              Pending Invitations ({pendingInvitations.length})
            </Text>
            <View style={styles.listCard}>
              {pendingInvitations.map((invitation, index) => (
                <View
                  key={invitation.id}
                  style={[
                    styles.invitationItem,
                    index === pendingInvitations.length - 1 && styles.memberItemLast,
                  ]}
                >
                  <View style={styles.invitationIcon}>
                    <Mail size={20} color={colors.primary} />
                  </View>
                  <View style={styles.invitationInfo}>
                    <Text style={styles.invitationEmail}>{invitation.email}</Text>
                    <View style={styles.invitationMeta}>
                      <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(invitation.role) }]}>
                        <Text style={styles.roleBadgeText}>{getRoleLabel(invitation.role)}</Text>
                      </View>
                      <View style={styles.expiresBadge}>
                        <Clock size={12} color={isExpired(invitation.expires_at) ? colors.error : colors.textTertiary} />
                        <Text style={[
                          styles.expiresText,
                          isExpired(invitation.expires_at) && styles.expiredText
                        ]}>
                          {isExpired(invitation.expires_at) ? 'Expired' : `Expires ${formatDate(invitation.expires_at)}`}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {canManageTeam && (
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => handleCancelInvitation(invitation)}
                    >
                      <X size={18} color={colors.error} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </>
        )}

        {/* Role Descriptions */}
        <Text style={styles.sectionTitle}>Role Permissions</Text>
        <View style={styles.listCard}>
          <View style={styles.roleDescItem}>
            <Crown size={18} color={colors.warning} />
            <View style={styles.roleDescContent}>
              <Text style={styles.roleDescTitle}>Owner</Text>
              <Text style={styles.roleDescText}>Full access, billing, can delete organization</Text>
            </View>
          </View>
          <View style={styles.roleDescItem}>
            <Shield size={18} color={colors.primary} />
            <View style={styles.roleDescContent}>
              <Text style={styles.roleDescTitle}>Manager</Text>
              <Text style={styles.roleDescText}>Full access, can manage team members</Text>
            </View>
          </View>
          <View style={styles.roleDescItem}>
            <User size={18} color={colors.info} />
            <View style={styles.roleDescContent}>
              <Text style={styles.roleDescTitle}>Staff</Text>
              <Text style={styles.roleDescText}>Can count, add items, send reports</Text>
            </View>
          </View>
          <View style={[styles.roleDescItem, styles.memberItemLast]}>
            <Eye size={18} color={colors.textTertiary} />
            <View style={styles.roleDescContent}>
              <Text style={styles.roleDescTitle}>Viewer</Text>
              <Text style={styles.roleDescText}>View only, cannot make changes</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Invite Modal */}
      <Modal
        visible={showInviteModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowInviteModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowInviteModal(false)}>
              <X size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Invite Team Member</Text>
            <TouchableOpacity
              onPress={handleInvite}
              disabled={isInviting || !inviteEmail.trim()}
            >
              {isInviting ? (
                <LoadingSpinner size={24} />
              ) : (
                <Check size={24} color={inviteEmail.trim() ? colors.primary : colors.textTertiary} />
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.inputLabel}>Email Address *</Text>
            <TextInput
              style={styles.textInput}
              value={inviteEmail}
              onChangeText={setInviteEmail}
              placeholder="colleague@company.com"
              placeholderTextColor={colors.textTertiary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.inputLabel}>Role *</Text>
            <TouchableOpacity
              style={styles.roleSelector}
              onPress={() => setShowRolePicker(!showRolePicker)}
            >
              <View style={styles.roleSelectorContent}>
                {getRoleIcon(inviteRole)}
                <Text style={styles.roleSelectorText}>{getRoleLabel(inviteRole)}</Text>
              </View>
              <ChevronDown size={20} color={colors.textTertiary} />
            </TouchableOpacity>

            {showRolePicker && (
              <View style={styles.rolePickerContainer}>
                {ROLES.map((role) => (
                  <TouchableOpacity
                    key={role.value}
                    style={[
                      styles.roleOption,
                      inviteRole === role.value && styles.roleOptionSelected,
                    ]}
                    onPress={() => {
                      setInviteRole(role.value);
                      setShowRolePicker(false);
                    }}
                  >
                    {getRoleIcon(role.value)}
                    <View style={styles.roleOptionContent}>
                      <Text style={styles.roleOptionLabel}>{role.label}</Text>
                      <Text style={styles.roleOptionDescription}>{role.description}</Text>
                    </View>
                    {inviteRole === role.value && (
                      <Check size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.inputLabel}>Personal Message (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={inviteMessage}
              onChangeText={setInviteMessage}
              placeholder="Add a personal message to the invitation..."
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={3}
            />

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                The invited person will receive an email with a link to join your team.
                The invitation will expire in 7 days.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Member Actions Modal */}
      <Modal
        visible={showMemberActions}
        animationType="fade"
        transparent
        onRequestClose={() => setShowMemberActions(false)}
      >
        <TouchableOpacity
          style={styles.actionModalOverlay}
          activeOpacity={1}
          onPress={() => setShowMemberActions(false)}
        >
          <View style={styles.actionModalContent}>
            <Text style={styles.actionModalTitle}>
              {selectedMember?.full_name}
            </Text>
            <Text style={styles.actionModalSubtitle}>
              {selectedMember?.email}
            </Text>

            {isOwner && selectedMember?.role !== 'owner' && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  setNewRole(selectedMember?.role || 'staff');
                  setShowMemberActions(false);
                  setShowRoleChangeModal(true);
                }}
              >
                <Shield size={20} color={colors.primary} />
                <Text style={styles.actionButtonText}>Change Role</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonDanger]}
              onPress={handleRemoveMember}
            >
              <X size={20} color={colors.error} />
              <Text style={[styles.actionButtonText, styles.actionButtonTextDanger]}>
                Remove from Team
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelActionButton}
              onPress={() => setShowMemberActions(false)}
            >
              <Text style={styles.cancelActionText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Role Change Modal */}
      <Modal
        visible={showRoleChangeModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowRoleChangeModal(false)}
      >
        <TouchableOpacity
          style={styles.actionModalOverlay}
          activeOpacity={1}
          onPress={() => setShowRoleChangeModal(false)}
        >
          <View style={styles.actionModalContent}>
            <Text style={styles.actionModalTitle}>Change Role</Text>
            <Text style={styles.actionModalSubtitle}>
              Select a new role for {selectedMember?.full_name}
            </Text>

            {ROLES.map((role) => (
              <TouchableOpacity
                key={role.value}
                style={[
                  styles.roleChangeOption,
                  newRole === role.value && styles.roleChangeOptionSelected,
                ]}
                onPress={() => setNewRole(role.value)}
              >
                {getRoleIcon(role.value)}
                <View style={styles.roleChangeContent}>
                  <Text style={styles.roleChangeLabel}>{role.label}</Text>
                  <Text style={styles.roleChangeDescription}>{role.description}</Text>
                </View>
                {newRole === role.value && (
                  <Check size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleChangeRole}
            >
              <Text style={styles.confirmButtonText}>Save Changes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelActionButton}
              onPress={() => setShowRoleChangeModal(false)}
            >
              <Text style={styles.cancelActionText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'owner':
      return colors.warning + '30';
    case 'manager':
      return colors.primary + '30';
    case 'staff':
      return colors.info + '30';
    case 'viewer':
      return colors.textTertiary + '30';
    default:
      return colors.surface;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.base,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginLeft: spacing.md,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: radius.base,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.base,
    paddingBottom: spacing['3xl'],
  },
  sectionTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  listCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  memberItemLast: {
    borderBottomWidth: 0,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  memberAvatarText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  memberName: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
  },
  memberEmail: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  memberMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  roleBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  roleBadgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    color: colors.textPrimary,
  },
  invitationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  invitationIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  invitationInfo: {
    flex: 1,
  },
  invitationEmail: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: colors.textPrimary,
  },
  invitationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  expiresBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expiresText: {
    fontSize: typography.size.xs,
    color: colors.textTertiary,
  },
  expiredText: {
    color: colors.error,
  },
  cancelButton: {
    padding: spacing.sm,
  },
  roleDescItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
    gap: spacing.md,
  },
  roleDescContent: {
    flex: 1,
  },
  roleDescTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: colors.textPrimary,
  },
  roleDescText: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  modalTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
  },
  modalContent: {
    flex: 1,
    padding: spacing.base,
  },
  inputLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.base,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    fontSize: typography.size.base,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  roleSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.base,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  roleSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  roleSelectorText: {
    fontSize: typography.size.base,
    color: colors.textPrimary,
  },
  rolePickerContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.base,
    marginTop: spacing.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
    gap: spacing.md,
  },
  roleOptionSelected: {
    backgroundColor: colors.primary + '15',
  },
  roleOptionContent: {
    flex: 1,
  },
  roleOptionLabel: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: colors.textPrimary,
  },
  roleOptionDescription: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  infoBox: {
    backgroundColor: colors.info + '20',
    borderRadius: radius.base,
    padding: spacing.base,
    marginTop: spacing.xl,
  },
  infoText: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  // Action Modal Styles
  actionModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.base,
  },
  actionModalContent: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 340,
  },
  actionModalTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  actionModalSubtitle: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.base,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  actionButtonDanger: {
    backgroundColor: colors.error + '15',
  },
  actionButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: colors.textPrimary,
  },
  actionButtonTextDanger: {
    color: colors.error,
  },
  cancelActionButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  cancelActionText: {
    fontSize: typography.size.base,
    color: colors.textSecondary,
  },
  roleChangeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radius.base,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  roleChangeOptionSelected: {
    backgroundColor: colors.primary + '20',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  roleChangeContent: {
    flex: 1,
  },
  roleChangeLabel: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: colors.textPrimary,
  },
  roleChangeDescription: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.base,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  confirmButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
  },
});

export default TeamManagement;

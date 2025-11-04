# Mobile App RBAC Implementation Guide

## Overview
Implement role-based access control where:
- **Staff**: Can view inventory, count, make orders - Cannot edit/add/delete
- **Manager/Owner**: Full access to everything including all PINs

## Changes to `/src/mobile/App.tsx`:

### 1. Update TeamPINScreen Component (Line ~3732)

Replace the entire `TeamPINScreen` component with this role-aware version:

```typescript
const TeamPINScreen = memo(({ user, userProfile, onBack }: { user: any; userProfile: any; onBack: () => void }) => {
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPINs, setShowPINs] = useState<Record<string, boolean>>({});
  const [managerVerified, setManagerVerified] = useState(false);
  const [showPINModal, setShowPINModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Check if current user is manager or owner
  const isManagerOrOwner = userProfile?.role === 'manager' || userProfile?.role === 'owner';

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id, role')
        .eq('id', user.id)
        .single();

      if (profile) {
        const { data: members } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('organization_id', profile.organization_id)
          .order('created_at', { ascending: true });

        setTeamMembers(members || []);

        // Auto-verify if user is manager/owner
        if (profile.role === 'manager' || profile.role === 'owner') {
          setManagerVerified(true);
        }
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyManagerPIN = async () => {
    if (pinInput.length < 4) {
      Alert.alert('Error', 'Please enter a 4-digit PIN');
      return;
    }

    try {
      setVerifying(true);
      const response = await fetch(`${apiUrl}/api/team/verify-manager-pin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pin: pinInput,
          organizationId: userProfile.organization_id
        })
      });

      const result = await response.json();

      if (result.valid) {
        setManagerVerified(true);
        setShowPINModal(false);
        setPinInput('');
        Alert.alert('Success', `Verified as ${result.manager.name}`);
      } else {
        Alert.alert('Invalid PIN', 'This PIN does not belong to a manager');
        setPinInput('');
      }
    } catch (error) {
      console.error('Error verifying PIN:', error);
      Alert.alert('Error', 'Failed to verify PIN');
    } finally {
      setVerifying(false);
    }
  };

  const togglePINVisibility = (userId: string) => {
    if (!managerVerified) {
      setShowPINModal(true);
      return;
    }
    setShowPINs(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  // Filter what staff can see
  const visibleMembers = isManagerOrOwner || managerVerified
    ? teamMembers
    : teamMembers.filter(m => m.id === user.id); // Staff sees only themselves

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.modernScreenHeader}>
        <TouchableOpacity onPress={onBack} style={styles.modernBackButton}>
          <ArrowLeft color="#1A1A1A" size={24} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.modernHeaderCenter}>
          <Text style={styles.modernScreenTitle}>Team & PINs</Text>
          <Text style={styles.modernScreenSubtitle}>
            {isManagerOrOwner || managerVerified ? 'View all team members' : 'Your profile'}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Manager PIN Modal */}
      <Modal
        visible={showPINModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowPINModal(false);
          setPinInput('');
        }}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, width: '85%', maxWidth: 400 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 8 }}>
              Manager Verification Required
            </Text>
            <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 20 }}>
              Enter a manager PIN to view all team member PINs
            </Text>

            <TextInput
              value={pinInput}
              onChangeText={setPinInput}
              placeholder="Enter 4-digit PIN"
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              style={{
                borderWidth: 1,
                borderColor: '#E5E7EB',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                marginBottom: 16
              }}
            />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  setShowPINModal(false);
                  setPinInput('');
                }}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  alignItems: 'center'
                }}
              >
                <Text style={{ color: '#6B7280', fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={verifyManagerPIN}
                disabled={verifying}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: '#F97316',
                  alignItems: 'center',
                  opacity: verifying ? 0.5 : 1
                }}
              >
                {verifying ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Verify</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }}>
          <View style={{ padding: 20 }}>
            {/* Access Notice for Staff */}
            {!isManagerOrOwner && !managerVerified && (
              <View style={{
                backgroundColor: '#FEF3C7',
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
                borderLeftWidth: 4,
                borderLeftColor: '#F59E0B'
              }}>
                <Text style={{ fontSize: 14, color: '#92400E', fontWeight: '600', marginBottom: 4 }}>
                  Limited Access
                </Text>
                <Text style={{ fontSize: 13, color: '#78350F' }}>
                  You can only view your own information. Enter a manager PIN to view all team members.
                </Text>
              </View>
            )}

            {/* Team Members List */}
            {visibleMembers.map((member, index) => (
              <View
                key={member.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1
                }}
              >
                {/* Member Info */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: '#F97316',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 12
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }}>
                      {(member.full_name || member.email).charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#1A1A1A', marginBottom: 2 }}>
                      {member.full_name || 'No Name'}
                    </Text>
                    {/* Show email only to managers/owners */}
                    {(isManagerOrOwner || managerVerified) && (
                      <Text style={{ fontSize: 13, color: '#6B7280' }}>
                        {member.email}
                      </Text>
                    )}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <RoleBadge role={member.role || 'staff'} />
                    </View>
                  </View>
                </View>

                {/* PIN Section */}
                <View
                  style={{
                    backgroundColor: '#F9FAFB',
                    borderRadius: 8,
                    padding: 12,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Key color="#6B7280" size={16} strokeWidth={2} />
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>
                      PIN:
                    </Text>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: '#1A1A1A',
                        letterSpacing: 2
                      }}
                    >
                      {(isManagerOrOwner || managerVerified) && showPINs[member.id]
                        ? member.pin_code
                        : '••••'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => togglePINVisibility(member.id)}
                    style={{ padding: 4 }}
                  >
                    <Text style={{ fontSize: 12, color: '#F97316', fontWeight: '600' }}>
                      {(isManagerOrOwner || managerVerified) && showPINs[member.id] ? 'Hide' : 'Show'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {visibleMembers.length === 0 && (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Users color="#9CA3AF" size={48} strokeWidth={1.5} />
                <Text style={{ fontSize: 16, color: '#6B7280', marginTop: 12 }}>
                  No team members found
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
});

// Add RoleBadge component
const RoleBadge = ({ role }: { role: string }) => {
  const colors = {
    owner: { bg: '#F3E8FF', text: '#7C3AED', icon: '👑' },
    manager: { bg: '#DBEAFE', text: '#2563EB', icon: '🔑' },
    staff: { bg: '#D1FAE5', text: '#059669', icon: '👤' },
    viewer: { bg: '#F3F4F6', text: '#6B7280', icon: '👁️' }
  };

  const style = colors[role as keyof typeof colors] || colors.staff;

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: style.bg,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4
    }}>
      <Text style={{ fontSize: 10 }}>{style.icon}</Text>
      <Text style={{ fontSize: 11, fontWeight: '600', color: style.text }}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Text>
    </View>
  );
};
```

### 2. Restrict More Tab Access (Line ~4146, in MoreScreen)

Update navigation items to check roles:

```typescript
// In MoreScreen component, add role check
const isManagerOrOwner = userProfile?.role === 'manager' || userProfile?.role === 'owner';

// Wrap restricted menu items with role checks:
{isManagerOrOwner && (
  <TouchableOpacity style={styles.modernMenuItem} onPress={handleAnalyticsPress} activeOpacity={0.7}>
    <View style={styles.modernMenuItemLeft}>
      <View style={[styles.modernMenuIcon, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
        <Activity color="#EC4899" size={20} strokeWidth={2.5} />
      </View>
      <Text style={styles.modernMenuItemText}>Stock Analytics</Text>
    </View>
    <ChevronRight color="#9CA3AF" size={20} strokeWidth={2.5} />
  </TouchableOpacity>
)}
```

### 3. Add Role Check to Edit/Delete Operations

In inventory screens, wrap edit/delete buttons:

```typescript
{(userProfile?.role === 'manager' || userProfile?.role === 'owner') && (
  <TouchableOpacity onPress={() => deleteItem(item.id)}>
    <Trash2 color="#EF4444" size={20} />
  </TouchableOpacity>
)}
```

### 4. Add apiUrl constant if missing
At the top of App.tsx with other constants:
```typescript
const apiUrl = process.env.EXPO_PUBLIC_API_URL!;
```

## Testing Checklist:
- [ ] Staff user can only see their own name/PIN
- [ ] Staff user prompted for manager PIN when clicking "Show" on PINs
- [ ] Manager PIN verification works
- [ ] Manager/Owner can see all PINs without verification
- [ ] Stock Analytics hidden for staff in More tab
- [ ] Edit/delete buttons hidden for staff
- [ ] Staff can still count and view inventory

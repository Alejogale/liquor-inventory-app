# Web Team & PINs Component Updates Needed

## Changes to `/src/components/TeamPINManagement.tsx`:

### 1. Update TeamMember Interface (Line 6-12)
```typescript
interface TeamMember {
  id: string
  email: string
  full_name: string | null
  pin_code: string | null
  role: 'owner' | 'manager' | 'staff' | 'viewer'  // ADD THIS LINE
  created_at: string
}
```

### 2. Update fetchTeamMembers Query (Around line 65-70)
Change the select to include role:
```typescript
const { data: members, error } = await supabase
  .from('user_profiles')
  .select('id, email, full_name, pin_code, role, created_at')  // Add 'role' here
  .eq('organization_id', profile.organization_id)
  .order('created_at', { ascending: true })
```

### 3. Add Role Column to Table Header (find the table headers section)
Add a new header between "PIN Code" and "Actions":
```typescript
<th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
  Role
</th>
```

### 4. Add Role Display in Table Body (in the map where team members are displayed)
Add this cell after the PIN cell:
```typescript
<td className="px-6 py-4 whitespace-nowrap text-sm">
  <RoleBadge role={member.role} />
</td>
```

### 5. Add RoleBadge Component (add before the main component)
```typescript
const RoleBadge = ({ role }: { role: string }) => {
  const colors = {
    owner: 'bg-purple-100 text-purple-800 border-purple-300',
    manager: 'bg-blue-100 text-blue-800 border-blue-300',
    staff: 'bg-green-100 text-green-800 border-green-300',
    viewer: 'bg-gray-100 text-gray-800 border-gray-300'
  }

  const icons = {
    owner: '👑',
    manager: '🔑',
    staff: '👤',
    viewer: '👁️'
  }

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${colors[role as keyof typeof colors] || colors.staff}`}>
      <span>{icons[role as keyof typeof icons] || icons.staff}</span>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  )
}
```

### 6. Add Role Selector in Edit Mode
When editing a user, add a role dropdown:
```typescript
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Role
  </label>
  <select
    value={member.role}
    onChange={(e) => handleRoleChange(member.id, e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
  >
    <option value="staff">Staff</option>
    <option value="manager">Manager</option>
    <option value="owner">Owner</option>
    <option value="viewer">Viewer</option>
  </select>
  <p className="mt-1 text-xs text-gray-500">
    Staff: View & count only • Manager: Full access • Owner: Admin rights
  </p>
</div>
```

### 7. Add handleRoleChange Function
```typescript
const handleRoleChange = async (userId: string, newRole: string) => {
  try {
    const response = await fetch('/api/team/update-role', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        newRole,
        updatedBy: user.id
      })
    })

    const result = await response.json()

    if (!response.ok) {
      alert(`Error: ${result.error}`)
      return
    }

    alert(`✅ Role updated successfully!`)
    await fetchTeamMembers() // Refresh the list
  } catch (error) {
    console.error('Error updating role:', error)
    alert('Failed to update role')
  }
}
```

## API Endpoints Already Created:
- `/api/team/update-role` - Updates user role (done ✅)
- `/api/team/verify-manager-pin` - Verifies manager PIN for mobile (done ✅)

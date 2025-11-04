import { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  RefreshControl,
  Modal,
  FlatList,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Package,
  ClipboardList,
  Building2,
  DollarSign,
  Home,
  BarChart3,
  Settings,
  Search,
  X as XIcon,
  ArrowLeft,
  CheckCircle,
  Trash2,
  Edit,
  ChevronRight,
  LogOut,
  Users,
  FileText,
  Bell,
  Plus,
  Minus,
  Scan,
  Download,
  Share2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  PieChartIcon,
  ArrowUpDown,
  Check,
  ShoppingCart,
  Mail,
  Phone,
  MessageSquare,
  Shield,
  Activity,
  Key
} from 'lucide-react-native';
import { createClient } from '@supabase/supabase-js';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { WifiOff, Wifi } from 'lucide-react-native';
import ModernOnboarding from './ModernOnboarding';
import { StatCard, QuickCountButtons } from './ModernComponents';

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
const apiUrl = process.env.EXPO_PUBLIC_API_URL!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Offline Data Service
const OfflineDataService = {
  // Cache keys
  CACHE_KEYS: {
    ITEMS: 'offline_items',
    CATEGORIES: 'offline_categories',
    ROOMS: 'offline_rooms',
    SUPPLIERS: 'offline_suppliers',
    COUNTS: 'offline_counts',
    PENDING_CHANGES: 'pending_changes',
    LAST_SYNC: 'last_sync_time',
  },

  // Save data to cache
  async cacheData(key: string, data: any) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error caching data:', error);
    }
  },

  // Get cached data
  async getCachedData(key: string) {
    try {
      const cached = await AsyncStorage.getItem(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error reading cache:', error);
      return null;
    }
  },

  // Save pending changes (for offline writes)
  async savePendingChange(change: any) {
    try {
      const pending = await this.getCachedData(this.CACHE_KEYS.PENDING_CHANGES) || [];
      pending.push({ ...change, timestamp: Date.now() });
      await this.cacheData(this.CACHE_KEYS.PENDING_CHANGES, pending);
    } catch (error) {
      console.error('Error saving pending change:', error);
    }
  },

  // Get pending changes
  async getPendingChanges() {
    return await this.getCachedData(this.CACHE_KEYS.PENDING_CHANGES) || [];
  },

  // Clear pending changes (after successful sync)
  async clearPendingChanges() {
    await AsyncStorage.removeItem(this.CACHE_KEYS.PENDING_CHANGES);
  },

  // Update last sync time
  async updateLastSync() {
    await AsyncStorage.setItem(this.CACHE_KEYS.LAST_SYNC, new Date().toISOString());
  },

  // Get last sync time
  async getLastSync() {
    return await AsyncStorage.getItem(this.CACHE_KEYS.LAST_SYNC);
  },

  // Sync pending changes to server
  async syncPendingChanges() {
    const pendingChanges = await this.getPendingChanges();
    if (pendingChanges.length === 0) {
      console.log('📭 No pending changes to sync');
      return { success: true, synced: 0, failed: 0 };
    }

    console.log(`🔄 Syncing ${pendingChanges.length} pending changes...`);
    const results = { success: 0, failed: 0, errors: [] as any[] };

    for (const change of pendingChanges) {
      try {
        await this.applyChange(change);
        results.success++;
      } catch (error) {
        console.error('❌ Failed to sync change:', change, error);
        results.failed++;
        results.errors.push({ change, error });
      }
    }

    // Remove successfully synced changes
    if (results.success > 0) {
      const remainingChanges = results.errors.map(e => e.change);
      await this.cacheData(this.CACHE_KEYS.PENDING_CHANGES, remainingChanges);
      await this.updateLastSync();
    }

    console.log(`✅ Sync complete: ${results.success} succeeded, ${results.failed} failed`);
    return results;
  },

  // Apply a single change to the server
  async applyChange(change: any) {
    const { type, table, data, id } = change;

    switch (type) {
      case 'insert':
        const { error: insertError } = await supabase.from(table).insert([data]);
        if (insertError) throw insertError;
        break;

      case 'update':
        const { error: updateError } = await supabase.from(table).update(data).eq('id', id);
        if (updateError) throw updateError;
        break;

      case 'delete':
        const { error: deleteError } = await supabase.from(table).delete().eq('id', id);
        if (deleteError) throw deleteError;
        break;

      case 'upsert_counts':
        // Handle room counts with delete-insert pattern
        const { room_id, items } = data;
        const itemIds = items.map((item: any) => item.inventory_item_id);

        // Delete existing counts
        const { error: delError } = await supabase
          .from('room_counts')
          .delete()
          .eq('room_id', room_id)
          .in('inventory_item_id', itemIds);

        if (delError) throw delError;

        // Insert new counts
        const { error: insError } = await supabase
          .from('room_counts')
          .insert(items);

        if (insError) throw insError;
        break;

      default:
        console.warn('Unknown change type:', type);
    }
  },

  // Check for conflicts with server data
  async checkConflicts(localData: any[], serverData: any[], idField = 'id') {
    const conflicts = [];
    const localMap = new Map(localData.map(item => [item[idField], item]));

    for (const serverItem of serverData) {
      const localItem = localMap.get(serverItem[idField]);
      if (localItem) {
        // Compare timestamps if available
        const localTime = localItem.updated_at || localItem.created_at;
        const serverTime = serverItem.updated_at || serverItem.created_at;

        if (localTime && serverTime && new Date(localTime) < new Date(serverTime)) {
          conflicts.push({
            id: serverItem[idField],
            local: localItem,
            server: serverItem,
            resolution: 'server_newer'
          });
        }
      }
    }

    return conflicts;
  },

  // Merge local and server data, preferring server on conflicts
  async resolveConflicts(conflicts: any[], localData: any[], idField = 'id') {
    if (conflicts.length === 0) return localData;

    const conflictIds = new Set(conflicts.map(c => c.id));
    const resolvedData = localData.filter(item => !conflictIds.has(item[idField]));

    // Add server versions of conflicted items
    conflicts.forEach(conflict => {
      resolvedData.push(conflict.server);
    });

    console.log(`⚠️ Resolved ${conflicts.length} conflicts (using server data)`);
    return resolvedData;
  },
};

// Add Room Modal Component
const AddRoomModal = memo(({ user, onClose, onRoomAdded }: { user: any; onClose: () => void; onRoomAdded: () => void }) => {
  const [roomName, setRoomName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!roomName.trim()) {
      Alert.alert('Error', 'Room name is required');
      return;
    }

    try {
      setIsSaving(true);

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        Alert.alert('Error', 'No organization found');
        return;
      }

      const { error } = await supabase
        .from('rooms')
        .insert([{
          name: roomName.trim(),
          organization_id: profile.organization_id,
          display_order: 0
        }]);

      if (error) throw error;

      Alert.alert('Success', 'Room added successfully');
      onRoomAdded();
      onClose();
    } catch (error) {
      console.error('Error adding room:', error);
      Alert.alert('Error', 'Failed to add room');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Add Room</Text>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
            <XIcon color="#6b7280" size={24} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={styles.modalBody}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Room Name</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g., Main Bar, Wine Cellar, Storage"
              placeholderTextColor="#9ca3af"
              value={roomName}
              onChangeText={setRoomName}
              autoFocus
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
            <TouchableOpacity
              style={[styles.saveButton, { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.12)' }]}
              onPress={onClose}
            >
              <Text style={[styles.saveButtonText, { color: 'rgba(255, 255, 255, 0.7)' }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, { flex: 1 }, isSaving && { opacity: 0.5 }]}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Adding...' : 'Add Room'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
});

// Edit Room Modal Component
const EditRoomModal = memo(({ room, user, onClose, onRoomUpdated }: { room: any; user: any; onClose: () => void; onRoomUpdated: () => void }) => {
  const [roomName, setRoomName] = useState(room.name);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!roomName.trim()) {
      Alert.alert('Error', 'Room name is required');
      return;
    }

    try {
      setIsSaving(true);

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        Alert.alert('Error', 'No organization found');
        return;
      }

      const { error } = await supabase
        .from('rooms')
        .update({ name: roomName.trim() })
        .eq('id', room.id)
        .eq('organization_id', profile.organization_id);

      if (error) throw error;

      Alert.alert('Success', 'Room updated successfully');
      onRoomUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating room:', error);
      Alert.alert('Error', 'Failed to update room');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Edit Room</Text>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
            <XIcon color="#6b7280" size={24} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={styles.modalBody}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Room Name</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Enter room name"
              placeholderTextColor="#9ca3af"
              value={roomName}
              onChangeText={setRoomName}
              autoFocus
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
            <TouchableOpacity
              style={[styles.saveButton, { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.12)' }]}
              onPress={onClose}
            >
              <Text style={[styles.saveButtonText, { color: 'rgba(255, 255, 255, 0.7)' }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, { flex: 1 }, isSaving && { opacity: 0.5 }]}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Updating...' : 'Update Room'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
});

// Add Supplier Modal Component
const AddSupplierModal = memo(({ user, onClose, onSupplierAdded }: { user: any; onClose: () => void; onSupplierAdded: () => void }) => {
  const [supplierName, setSupplierName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!supplierName.trim() || !email.trim()) {
      Alert.alert('Error', 'Supplier name and email are required');
      return;
    }

    try {
      setIsSaving(true);
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        Alert.alert('Error', 'No organization found');
        return;
      }

      const { error } = await supabase
        .from('suppliers')
        .insert([{
          name: supplierName.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          contact_person: contactPerson.trim() || null,
          notes: notes.trim() || null,
          organization_id: profile.organization_id
        }]);

      if (error) throw error;
      Alert.alert('Success', 'Supplier added successfully');
      onSupplierAdded();
      onClose();
    } catch (error) {
      console.error('Error adding supplier:', error);
      Alert.alert('Error', 'Failed to add supplier');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Add Supplier</Text>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
            <XIcon color="#6b7280" size={24} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalBody}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Supplier Name *</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g., Johnson Brothers, ABC Liquors"
              placeholderTextColor="#9ca3af"
              value={supplierName}
              onChangeText={setSupplierName}
              autoFocus
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Email *</Text>
            <TextInput
              style={styles.formInput}
              placeholder="orders@supplier.com"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Phone</Text>
            <TextInput
              style={styles.formInput}
              placeholder="(555) 123-4567"
              placeholderTextColor="#9ca3af"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Contact Person</Text>
            <TextInput
              style={styles.formInput}
              placeholder="John Smith, Sales Rep"
              placeholderTextColor="#9ca3af"
              value={contactPerson}
              onChangeText={setContactPerson}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Notes</Text>
            <TextInput
              style={[styles.formInput, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Special instructions, delivery schedules, etc."
              placeholderTextColor="#9ca3af"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
            <TouchableOpacity
              style={[styles.saveButton, { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.12)' }]}
              onPress={onClose}
            >
              <Text style={[styles.saveButtonText, { color: 'rgba(255, 255, 255, 0.7)' }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, { flex: 1 }, isSaving && { opacity: 0.5 }]}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Adding...' : 'Add Supplier'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
});

// Edit Supplier Modal Component
const EditSupplierModal = memo(({ supplier, user, onClose, onSupplierUpdated }: { supplier: any; user: any; onClose: () => void; onSupplierUpdated: () => void }) => {
  const [supplierName, setSupplierName] = useState(supplier.name);
  const [email, setEmail] = useState(supplier.email);
  const [phone, setPhone] = useState(supplier.phone || '');
  const [contactPerson, setContactPerson] = useState(supplier.contact_person || '');
  const [notes, setNotes] = useState(supplier.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!supplierName.trim() || !email.trim()) {
      Alert.alert('Error', 'Supplier name and email are required');
      return;
    }

    try {
      setIsSaving(true);
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        Alert.alert('Error', 'No organization found');
        return;
      }

      const { error } = await supabase
        .from('suppliers')
        .update({
          name: supplierName.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          contact_person: contactPerson.trim() || null,
          notes: notes.trim() || null
        })
        .eq('id', supplier.id)
        .eq('organization_id', profile.organization_id);

      if (error) throw error;
      Alert.alert('Success', 'Supplier updated successfully');
      onSupplierUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating supplier:', error);
      Alert.alert('Error', 'Failed to update supplier');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Edit Supplier</Text>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
            <XIcon color="#6b7280" size={24} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalBody}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Supplier Name *</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g., Johnson Brothers, ABC Liquors"
              placeholderTextColor="#9ca3af"
              value={supplierName}
              onChangeText={setSupplierName}
              autoFocus
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Email *</Text>
            <TextInput
              style={styles.formInput}
              placeholder="orders@supplier.com"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Phone</Text>
            <TextInput
              style={styles.formInput}
              placeholder="(555) 123-4567"
              placeholderTextColor="#9ca3af"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Contact Person</Text>
            <TextInput
              style={styles.formInput}
              placeholder="John Smith, Sales Rep"
              placeholderTextColor="#9ca3af"
              value={contactPerson}
              onChangeText={setContactPerson}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Notes</Text>
            <TextInput
              style={[styles.formInput, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Special instructions, delivery schedules, etc."
              placeholderTextColor="#9ca3af"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
            <TouchableOpacity
              style={[styles.saveButton, { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.12)' }]}
              onPress={onClose}
            >
              <Text style={[styles.saveButtonText, { color: 'rgba(255, 255, 255, 0.7)' }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, { flex: 1 }, isSaving && { opacity: 0.5 }]}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Updating...' : 'Update Supplier'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
});

// Rooms Screen Component
const RoomsScreen = memo(({ user, onBack }: { user: any; onBack: () => void }) => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);

  const fetchRooms = useCallback(async () => {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('name');

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      Alert.alert('Error', 'Failed to load rooms');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchRooms();
  }, [fetchRooms]);

  const handleDelete = useCallback(async (roomId: string, roomName: string) => {
    Alert.alert(
      'Delete Room',
      `Are you sure you want to delete "${roomName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { data: profile } = await supabase
                .from('user_profiles')
                .select('organization_id')
                .eq('id', user.id)
                .single();

              const { error } = await supabase
                .from('rooms')
                .delete()
                .eq('id', roomId)
                .eq('organization_id', profile?.organization_id);

              if (error) throw error;
              fetchRooms();
            } catch (error) {
              console.error('Error deleting room:', error);
              Alert.alert('Error', 'Failed to delete room');
            }
          },
        },
      ]
    );
  }, [fetchRooms, user.id]);

  const handleEdit = (room: any) => {
    setEditingRoom(room);
    setShowEditModal(true);
  };

  const handleRoomAdded = () => {
    fetchRooms();
    setShowAddModal(false);
  };

  const handleRoomUpdated = () => {
    fetchRooms();
    setShowEditModal(false);
    setEditingRoom(null);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={styles.loadingText}>Loading rooms...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Modern Header */}
      <View style={styles.modernScreenHeader}>
        <TouchableOpacity onPress={onBack} style={styles.modernBackButton}>
          <ArrowLeft color="#1A1A1A" size={24} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.modernHeaderCenter}>
          <Text style={styles.modernScreenTitle}>Rooms</Text>
          <Text style={styles.modernScreenSubtitle}>
            {rooms.length} {rooms.length === 1 ? 'room' : 'rooms'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.modernAddButton}>
          <Plus color="#fff" size={20} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Rooms Grid */}
      <ScrollView
        style={styles.itemsList}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#F97316" />
        }
      >
        {rooms.length === 0 ? (
          <View style={styles.emptyState}>
            <Building2 color="#9ca3af" size={64} strokeWidth={1.5} />
            <Text style={styles.emptyStateTitle}>No rooms yet</Text>
            <Text style={styles.emptyStateText}>
              Tap the + button above to create your first room
            </Text>
          </View>
        ) : (
          <View style={styles.modernCategoriesGrid}>
            {rooms.map((room) => (
              <View key={room.id} style={styles.modernCategoryCard}>
                <View style={styles.modernCategoryTop}>
                  <View style={[styles.modernCategoryIconWrapper, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                    <Building2 color="#10B981" size={24} strokeWidth={2.5} />
                  </View>
                  <Text style={styles.modernCategoryName} numberOfLines={1}>{room.name}</Text>
                </View>
                <View style={styles.modernCategoryActions}>
                  <TouchableOpacity
                    style={styles.modernEditButton}
                    onPress={() => handleEdit(room)}
                    activeOpacity={0.7}
                  >
                    <Edit color="#F97316" size={16} strokeWidth={2.5} />
                    <Text style={styles.modernEditButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modernDeleteButton}
                    onPress={() => handleDelete(room.id, room.name)}
                    activeOpacity={0.7}
                  >
                    <Trash2 color="#EF4444" size={16} strokeWidth={2.5} />
                    <Text style={styles.modernDeleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      {showAddModal && (
        <AddRoomModal
          user={user}
          onClose={() => setShowAddModal(false)}
          onRoomAdded={handleRoomAdded}
        />
      )}

      {showEditModal && editingRoom && (
        <EditRoomModal
          room={editingRoom}
          user={user}
          onClose={() => {
            setShowEditModal(false);
            setEditingRoom(null);
          }}
          onRoomUpdated={handleRoomUpdated}
        />
      )}
    </View>
  );
});

// Barcode Scanner Screen Component
const BarcodeScannerScreen = memo(({ user, onItemFound, onBack }: { user: any; onItemFound: (item: any) => void; onBack: () => void }) => {
  const [items, setItems] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [nameSearchInput, setNameSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        setIsLoading(false);
        return;
      }

      const orgId = profile.organization_id;

      // Fetch items and categories in parallel
      const [itemsRes, categoriesRes] = await Promise.all([
        supabase.from('inventory_items').select('*').eq('organization_id', orgId).order('brand'),
        supabase.from('categories').select('*').eq('organization_id', orgId)
      ]);

      if (itemsRes.error) throw itemsRes.error;

      // Enrich items with category names
      const enrichedItems = (itemsRes.data || []).map(item => {
        const category = categoriesRes.data?.find(cat => cat.id === item.category_id);
        return {
          ...item,
          category_name: category?.name || 'Unknown'
        };
      });

      setItems(enrichedItems);
    } catch (error) {
      console.error('Error fetching items:', error);
      Alert.alert('Error', 'Failed to load inventory items');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [user.id]);

  const searchByBarcode = (barcode: string) => {
    if (!barcode.trim()) {
      setSearchResults([]);
      return;
    }

    const found = items.filter(item =>
      item.barcode && item.barcode.includes(barcode.trim())
    );
    setSearchResults(found);

    // Auto-select if exactly one match
    if (found.length === 1) {
      onItemFound(found[0]);
      onBack();
    }
  };

  const searchByName = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const found = items.filter(item =>
      item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(found);
  };

  useEffect(() => {
    searchByBarcode(barcodeInput);
  }, [barcodeInput, items]);

  useEffect(() => {
    searchByName(nameSearchInput);
  }, [nameSearchInput, items]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={styles.loadingText}>Loading items...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.inventoryHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft color="#f97316" size={20} strokeWidth={2.5} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.inventoryTitle}>Barcode Scanner</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scannerContent}>
        {/* Barcode Input Section */}
        <View style={styles.scannerSection}>
          <Text style={styles.scannerSectionTitle}>⌨️ Barcode Entry</Text>
          <Text style={styles.scannerSectionSubtitle}>
            Use your Bluetooth scanner or type barcode manually
          </Text>
          <TextInput
            style={styles.scannerInput}
            placeholder="Scan or type barcode..."
            placeholderTextColor="#9ca3af"
            value={barcodeInput}
            onChangeText={setBarcodeInput}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Name Search Section */}
        <View style={styles.scannerSection}>
          <Text style={styles.scannerSectionTitle}>🔍 Search by Name</Text>
          <Text style={styles.scannerSectionSubtitle}>
            Find items by brand or category name
          </Text>
          <TextInput
            style={styles.scannerInput}
            placeholder="Search brand or category..."
            placeholderTextColor="#9ca3af"
            value={nameSearchInput}
            onChangeText={setNameSearchInput}
            autoCapitalize="none"
          />
        </View>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <View style={styles.scannerSection}>
            <Text style={styles.scannerSectionTitle}>
              📦 Found {searchResults.length} item(s)
            </Text>
            <View style={styles.scannerResults}>
              {searchResults.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.scannerResultCard}
                  onPress={() => {
                    onItemFound(item);
                    onBack();
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.scannerResultBrand}>{item.brand}</Text>
                    <Text style={styles.scannerResultCategory}>{item.category_name}</Text>
                    {item.barcode && (
                      <Text style={styles.scannerResultBarcode}>Barcode: {item.barcode}</Text>
                    )}
                  </View>
                  <View style={styles.scannerResultInfo}>
                    <Text style={styles.scannerResultInfoText}>Par: {item.par_level}</Text>
                    <Text style={styles.scannerResultInfoText}>Threshold: {item.threshold}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* All Items List */}
        {searchResults.length === 0 && (
          <View style={styles.scannerSection}>
            <Text style={styles.scannerSectionTitle}>
              📋 All Items ({items.length})
            </Text>
            <Text style={styles.scannerSectionSubtitle}>
              Tap any item to select it
            </Text>
            <View style={styles.scannerResults}>
              {items.slice(0, 20).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.scannerResultCard}
                  onPress={() => {
                    onItemFound(item);
                    onBack();
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.scannerResultBrand}>{item.brand}</Text>
                    <Text style={styles.scannerResultCategory}>{item.category_name}</Text>
                    {item.barcode && (
                      <Text style={styles.scannerResultBarcode}>Barcode: {item.barcode}</Text>
                    )}
                  </View>
                  <ChevronRight color="#9ca3af" size={20} strokeWidth={2} />
                </TouchableOpacity>
              ))}
              {items.length > 20 && (
                <Text style={styles.scannerMoreItems}>
                  ... and {items.length - 20} more items. Use search to find them.
                </Text>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
});

// Suppliers Screen Component
const SuppliersScreen = memo(({ user, onBack }: { user: any; onBack: () => void }) => {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);

  const fetchSuppliers = async () => {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('name');

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      Alert.alert('Error', 'Failed to load suppliers');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [user.id]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchSuppliers();
  };

  const handleDelete = async (supplierId: string, supplierName: string) => {
    Alert.alert(
      'Delete Supplier',
      `Are you sure you want to delete "${supplierName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { data: profile } = await supabase
                .from('user_profiles')
                .select('organization_id')
                .eq('id', user.id)
                .single();

              const { error } = await supabase
                .from('suppliers')
                .delete()
                .eq('id', supplierId)
                .eq('organization_id', profile?.organization_id);

              if (error) throw error;
              fetchSuppliers();
            } catch (error) {
              console.error('Error deleting supplier:', error);
              Alert.alert('Error', 'Failed to delete supplier');
            }
          },
        },
      ]
    );
  };

  const handleEdit = (supplier: any) => {
    setEditingSupplier(supplier);
    setShowEditModal(true);
  };

  const handleSupplierAdded = () => {
    fetchSuppliers();
    setShowAddModal(false);
  };

  const handleSupplierUpdated = () => {
    fetchSuppliers();
    setShowEditModal(false);
    setEditingSupplier(null);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={styles.loadingText}>Loading suppliers...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Modern Header */}
      <View style={styles.modernScreenHeader}>
        <TouchableOpacity onPress={onBack} style={styles.modernBackButton}>
          <ArrowLeft color="#1A1A1A" size={24} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.modernHeaderCenter}>
          <Text style={styles.modernScreenTitle}>Suppliers</Text>
          <Text style={styles.modernScreenSubtitle}>
            {suppliers.length} {suppliers.length === 1 ? 'supplier' : 'suppliers'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.modernAddButton}>
          <Plus color="#fff" size={20} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Suppliers List */}
      <ScrollView
        style={styles.itemsList}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#F97316" />
        }
      >
        {suppliers.length === 0 ? (
          <View style={styles.emptyState}>
            <Package color="#9ca3af" size={64} strokeWidth={1.5} />
            <Text style={styles.emptyStateTitle}>No suppliers yet</Text>
            <Text style={styles.emptyStateText}>
              Tap the + button above to add your first supplier
            </Text>
          </View>
        ) : (
          <View style={styles.modernSuppliersGrid}>
            {suppliers.map((supplier) => (
              <View key={supplier.id} style={styles.modernSupplierCard}>
                <View style={styles.modernSupplierTop}>
                  <View style={styles.modernSupplierIconWrapper}>
                    <Package color="#8B5CF6" size={24} strokeWidth={2.5} />
                  </View>
                  <View style={styles.modernSupplierInfo}>
                    <Text style={styles.modernSupplierName} numberOfLines={1}>{supplier.name}</Text>
                    <Text style={styles.modernSupplierEmail} numberOfLines={1}>{supplier.email}</Text>
                    {supplier.phone && (
                      <Text style={styles.modernSupplierDetail}>{supplier.phone}</Text>
                    )}
                    {supplier.contact_person && (
                      <Text style={styles.modernSupplierDetail}>Contact: {supplier.contact_person}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.modernCategoryActions}>
                  <TouchableOpacity
                    style={styles.modernEditButton}
                    onPress={() => handleEdit(supplier)}
                    activeOpacity={0.7}
                  >
                    <Edit color="#F97316" size={16} strokeWidth={2.5} />
                    <Text style={styles.modernEditButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modernDeleteButton}
                    onPress={() => handleDelete(supplier.id, supplier.name)}
                    activeOpacity={0.7}
                  >
                    <Trash2 color="#EF4444" size={16} strokeWidth={2.5} />
                    <Text style={styles.modernDeleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      {showAddModal && (
        <AddSupplierModal
          user={user}
          onClose={() => setShowAddModal(false)}
          onSupplierAdded={handleSupplierAdded}
        />
      )}

      {showEditModal && editingSupplier && (
        <EditSupplierModal
          supplier={editingSupplier}
          user={user}
          onClose={() => {
            setShowEditModal(false);
            setEditingSupplier(null);
          }}
          onSupplierUpdated={handleSupplierUpdated}
        />
      )}
    </View>
  );
});

// Shopping Cart Screen Component
const ShoppingCartScreen = memo(({ user, onBack }: { user: any; onBack: () => void }) => {
  const [view, setView] = useState<'browse' | 'cart' | 'review'>('browse');
  const [items, setItems] = useState<any[]>([]);
  const [cart, setCart] = useState<Map<string, { item: any; quantity: number; notes: string }>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        setIsLoading(false);
        return;
      }

      const [itemsRes, categoriesRes, suppliersRes] = await Promise.all([
        supabase.from('inventory_items').select('*').eq('organization_id', profile.organization_id),
        supabase.from('categories').select('*').eq('organization_id', profile.organization_id),
        supabase.from('suppliers').select('*').eq('organization_id', profile.organization_id),
      ]);

      const itemsData = itemsRes.data || [];
      const categories = categoriesRes.data || [];

      // Enrich items with category names
      const enrichedItems = itemsData.map((item: any) => ({
        ...item,
        category_name: categories.find((c: any) => c.id === item.category_id)?.name || 'Unknown'
      }));

      setItems(enrichedItems);
      setSuppliers(suppliersRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load inventory');
    } finally {
      setIsLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addToCart = (item: any) => {
    const newCart = new Map(cart);
    if (newCart.has(item.id)) {
      Alert.alert('Already in Cart', 'This item is already in your cart');
    } else {
      newCart.set(item.id, { item, quantity: 1, notes: '' });
      setCart(newCart);
      Alert.alert('Added', `${item.brand} added to cart`);
    }
  };

  const removeFromCart = (itemId: string) => {
    const newCart = new Map(cart);
    newCart.delete(itemId);
    setCart(newCart);
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    const newCart = new Map(cart);
    const cartItem = newCart.get(itemId);
    if (cartItem && quantity > 0) {
      newCart.set(itemId, { ...cartItem, quantity });
      setCart(newCart);
    }
  };

  const updateCartNotes = (itemId: string, notes: string) => {
    const newCart = new Map(cart);
    const cartItem = newCart.get(itemId);
    if (cartItem) {
      newCart.set(itemId, { ...cartItem, notes });
      setCart(newCart);
    }
  };

  const sendOrder = async (method: 'email' | 'sms' | 'phone', supplierId?: string) => {
    try {
      const cartItems = Array.from(cart.values());

      // Filter items by supplier if specified
      const itemsToSend = supplierId
        ? cartItems.filter(ci => ci.item.supplier_id === supplierId)
        : cartItems;

      if (itemsToSend.length === 0) {
        Alert.alert('Error', 'No items to send');
        return;
      }

      // Find supplier info
      const supplier = supplierId ? suppliers.find(s => s.id === supplierId) : null;

      if (method === 'email') {
        // Open native email app with pre-filled content
        const orderText = formatOrderMessage(itemsToSend, supplier);
        const emailTo = supplier?.email || '';
        const subject = `Order Request from ${user.email}`;
        const body = encodeURIComponent(orderText);

        const mailtoUrl = `mailto:${emailTo}?subject=${encodeURIComponent(subject)}&body=${body}`;

        const canOpen = await Linking.canOpenURL(mailtoUrl);
        if (canOpen) {
          await Linking.openURL(mailtoUrl);
        } else {
          Alert.alert('Error', 'Cannot open email app. Please check if you have an email app installed.');
        }
      } else if (method === 'sms') {
        // Open iOS Messages app with pre-filled text
        const orderText = formatOrderMessage(itemsToSend, supplier);
        const smsUrl = `sms:${supplier?.phone || ''}&body=${encodeURIComponent(orderText)}`;

        const canOpen = await Linking.canOpenURL(smsUrl);
        if (canOpen) {
          await Linking.openURL(smsUrl);
        } else {
          Alert.alert('Error', 'Cannot open Messages app');
        }
      } else if (method === 'phone') {
        // Open phone dialer
        if (!supplier?.phone) {
          Alert.alert('Error', 'Supplier phone number not found');
          return;
        }

        const phoneUrl = `tel:${supplier.phone}`;
        const canOpen = await Linking.canOpenURL(phoneUrl);

        if (canOpen) {
          Alert.alert('Call Supplier', `Call ${supplier.name} at ${supplier.phone}?`, [
            { text: 'Cancel' },
            { text: 'Call', onPress: () => Linking.openURL(phoneUrl) }
          ]);
        } else {
          Alert.alert('Error', 'Cannot make phone calls on this device');
        }
      }
    } catch (error) {
      console.error('Error sending order:', error);
      Alert.alert('Error', `Failed to send order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const formatOrderMessage = (cartItems: any[], supplier: any | null) => {
    const lines = [
      'ORDER REQUEST',
      `Date: ${new Date().toLocaleDateString()}`,
      supplier ? `To: ${supplier.name}` : 'Custom Order',
      '',
      '─'.repeat(40),
      ''
    ];

    cartItems.forEach(({ item, quantity, notes }) => {
      lines.push(`${item.brand}`);
      lines.push(`  Category: ${item.category_name}`);
      lines.push(`  Quantity: ${quantity}`);
      if (notes) lines.push(`  Notes: ${notes}`);
      // Price information removed from message
      lines.push('');
    });

    // Total calculation removed from message

    return lines.join('\n');
  };

  const filteredItems = searchQuery
    ? items.filter(item =>
        item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : items;

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={styles.loadingText}>Loading inventory...</Text>
      </View>
    );
  }

  // Browse Items View
  if (view === 'browse') {
    return (
      <View style={styles.container}>
        <View style={styles.inventoryHeader}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeft color="#f97316" size={20} strokeWidth={2.5} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.inventoryTitle}>Create Order</Text>
          <TouchableOpacity
            onPress={() => setView('cart')}
            style={styles.cartBadgeButton}
          >
            <ShoppingCart color="#f97316" size={24} strokeWidth={2.5} />
            {cart.size > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cart.size}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search color="#9CA3AF" size={18} strokeWidth={2} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search items..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <XIcon color="#9CA3AF" size={18} strokeWidth={2} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView style={styles.itemsList}>
          <View style={styles.shoppingItemsGrid}>
            {filteredItems.map((item) => (
              <View key={item.id} style={styles.shoppingItemCard}>
                <View style={styles.shoppingItemContent}>
                  <Text style={styles.shoppingItemBrand}>{item.brand}</Text>
                  <Text style={styles.shoppingItemCategory}>{item.category_name}</Text>
                  {item.price_per_item > 0 && (
                    <Text style={styles.shoppingItemPrice}>${item.price_per_item}</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={[
                    styles.addToCartButton,
                    cart.has(item.id) && styles.addToCartButtonDisabled
                  ]}
                  onPress={() => addToCart(item)}
                  disabled={cart.has(item.id)}
                >
                  <Text style={styles.addToCartButtonText}>
                    {cart.has(item.id) ? '✓ Added' : '+ Add'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  // Cart View
  if (view === 'cart') {
    const cartItems = Array.from(cart.values());
    return (
      <View style={styles.container}>
        <View style={styles.inventoryHeader}>
          <TouchableOpacity onPress={() => setView('browse')} style={styles.backButton}>
            <ArrowLeft color="#f97316" size={20} strokeWidth={2.5} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.inventoryTitle}>Cart ({cart.size})</Text>
          <View style={{ width: 50 }} />
        </View>

        {cartItems.length === 0 ? (
          <View style={styles.emptyState}>
            <ShoppingCart color="#9ca3af" size={64} strokeWidth={1.5} />
            <Text style={styles.emptyStateTitle}>Cart is Empty</Text>
            <Text style={styles.emptyStateText}>
              Add items from the browse screen to get started
            </Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => setView('browse')}
            >
              <Text style={styles.emptyStateButtonText}>Browse Items</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView style={styles.itemsList}>
            <View style={styles.cartItemsContainer}>
              {cartItems.map(({ item, quantity, notes }) => (
                <View key={item.id} style={styles.cartItemCard}>
                  <View style={styles.cartItemHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cartItemBrand}>{item.brand}</Text>
                      <Text style={styles.cartItemCategory}>{item.category_name}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => removeFromCart(item.id)}
                      style={styles.removeButton}
                    >
                      <Trash2 color="#ef4444" size={20} strokeWidth={2} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.cartItemControls}>
                    <View style={styles.quantityControl}>
                      <Text style={styles.quantityLabel}>Quantity:</Text>
                      <View style={styles.quantityButtons}>
                        <TouchableOpacity
                          onPress={() => updateCartQuantity(item.id, quantity - 1)}
                          style={styles.quantityButton}
                          disabled={quantity <= 1}
                        >
                          <Minus color={quantity <= 1 ? '#9ca3af' : '#f97316'} size={16} strokeWidth={2.5} />
                        </TouchableOpacity>
                        <Text style={styles.quantityValue}>{quantity}</Text>
                        <TouchableOpacity
                          onPress={() => updateCartQuantity(item.id, quantity + 1)}
                          style={styles.quantityButton}
                        >
                          <Plus color="#f97316" size={16} strokeWidth={2.5} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  <View style={styles.notesContainer}>
                    <Text style={styles.notesLabel}>Notes (e.g., "Cases not bottles"):</Text>
                    <TextInput
                      style={styles.notesInput}
                      placeholder="Special instructions..."
                      placeholderTextColor="#9ca3af"
                      value={notes}
                      onChangeText={(text) => updateCartNotes(item.id, text)}
                      multiline
                    />
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.cartFooter}>
              <TouchableOpacity
                style={styles.reviewOrderButton}
                onPress={() => setView('review')}
              >
                <LinearGradient
                  colors={['#f97316', '#ea580c']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.reviewOrderGradient}
                >
                  <Text style={styles.reviewOrderButtonText}>
                    Review & Send Order
                  </Text>
                  <ChevronRight color="#FFFFFF" size={20} strokeWidth={2.5} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>
    );
  }

  // Review & Send View
  if (view === 'review') {
    const cartItems = Array.from(cart.values());
    const supplierGroups = new Map<string, any>();

    cartItems.forEach(({ item, quantity, notes }) => {
      const supplierId = item.supplier_id || 'no-supplier';
      if (!supplierGroups.has(supplierId)) {
        const supplier = suppliers.find(s => s.id === supplierId);
        supplierGroups.set(supplierId, {
          supplier: supplier || { name: 'No Supplier', email: null, phone: null },
          items: []
        });
      }
      supplierGroups.get(supplierId).items.push({ item, quantity, notes });
    });

    return (
      <View style={styles.container}>
        <View style={styles.inventoryHeader}>
          <TouchableOpacity onPress={() => setView('cart')} style={styles.backButton}>
            <ArrowLeft color="#f97316" size={20} strokeWidth={2.5} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.inventoryTitle}>Review Order</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView style={styles.itemsList}>
          <View style={styles.reviewContainer}>
            {/* Send All Button */}
            {cartItems.length > 0 && (
              <View style={styles.sendAllContainer}>
                <Text style={styles.sendAllTitle}>Send Entire Order:</Text>
                <View style={styles.sendButtonsRow}>
                  <TouchableOpacity
                    style={styles.sendAllButton}
                    onPress={() => sendOrder('email')}
                  >
                    <Mail color="#FFFFFF" size={20} strokeWidth={2} />
                    <Text style={styles.sendAllButtonText}>Email</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.sendAllButton}
                    onPress={() => sendOrder('sms')}
                  >
                    <MessageSquare color="#FFFFFF" size={20} strokeWidth={2} />
                    <Text style={styles.sendAllButtonText}>SMS</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Individual Supplier Cards */}
            {Array.from(supplierGroups.entries()).map(([supplierId, { supplier, items }]) => (
              <View key={supplierId} style={styles.reviewSupplierCard}>
                <Text style={styles.reviewSupplierName}>{supplier.name}</Text>
                <Text style={styles.reviewSupplierItems}>{items.length} items</Text>

                {items.map(({ item, quantity, notes }: any, idx: number) => (
                  <View key={idx} style={styles.reviewItemRow}>
                    <Text style={styles.reviewItemName}>{item.brand}</Text>
                    <Text style={styles.reviewItemQty}>× {quantity}</Text>
                    {notes && <Text style={styles.reviewItemNotes}>Note: {notes}</Text>}
                  </View>
                ))}

                <View style={styles.sendOptionsContainer}>
                  <Text style={styles.sendOptionsTitle}>Send to {supplier.name}:</Text>
                  <View style={styles.sendButtonsRow}>
                    <TouchableOpacity
                      style={styles.sendOptionButton}
                      onPress={() => sendOrder('email', supplierId)}
                    >
                      <Mail color="#f97316" size={20} strokeWidth={2} />
                      <Text style={styles.sendOptionText}>Email</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.sendOptionButton}
                      onPress={() => sendOrder('sms', supplierId)}
                    >
                      <MessageSquare color="#f97316" size={20} strokeWidth={2} />
                      <Text style={styles.sendOptionText}>SMS</Text>
                    </TouchableOpacity>
                    {supplier.phone && (
                      <TouchableOpacity
                        style={styles.sendOptionButton}
                        onPress={() => sendOrder('phone', supplierId)}
                      >
                        <Phone color="#f97316" size={20} strokeWidth={2} />
                        <Text style={styles.sendOptionText}>Call</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  return null;
});

// Orders Screen Component
const OrdersScreen = memo(({ user, onBack }: { user: any; onBack: () => void }) => {
  const [showShoppingCart, setShowShoppingCart] = useState(false);
  const [orderGroups, setOrderGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedSuppliers, setExpandedSuppliers] = useState<Set<string>>(new Set());
  const [summaryStats, setSummaryStats] = useState({
    totalItems: 0,
    totalUnits: 0,
    totalValue: 0,
    suppliersAffected: 0
  });

  const generateOrderReport = useCallback(async () => {
    try {
      // Get user's organization
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        setIsLoading(false);
        return;
      }

      const orgId = profile.organization_id;

      // Fetch all required data in parallel
      const [itemsRes, categoriesRes, suppliersRes, countsRes, roomsRes] = await Promise.all([
        supabase.from('inventory_items').select('*').eq('organization_id', orgId),
        supabase.from('categories').select('*').eq('organization_id', orgId),
        supabase.from('suppliers').select('*').eq('organization_id', orgId),
        supabase.from('room_counts').select('*'),
        supabase.from('rooms').select('*').eq('organization_id', orgId),
      ]);

      if (itemsRes.error) throw itemsRes.error;

      const items = itemsRes.data || [];
      const categories = categoriesRes.data || [];
      const suppliers = suppliersRes.data || [];
      const counts = countsRes.data || [];
      const rooms = roomsRes.data || [];

      // Calculate order needs
      const orderNeeds: any[] = [];

      items.forEach((item) => {
        // Get total stock across all rooms
        const itemCounts = counts.filter((c: any) => c.inventory_item_id === item.id);
        const totalStock = itemCounts.reduce((sum: number, c: any) => sum + c.count, 0);

        // Check if item is below threshold
        if (totalStock <= item.threshold) {
          const needed = Math.max(item.par_level - totalStock, 1);
          const itemPrice = item.price_per_item || 0;
          const totalValue = needed * itemPrice;

          // Get category name
          const category = categories.find((c: any) => c.id === item.category_id);

          // Get supplier info
          const supplier = suppliers.find((s: any) => s.id === item.supplier_id);

          // Get room breakdown
          const roomsWithStock = itemCounts
            .filter((c: any) => c.count > 0)
            .map((c: any) => {
              const room = rooms.find((r: any) => r.id === c.room_id);
              return {
                room_name: room?.name || 'Unknown Room',
                count: c.count
              };
            });

          orderNeeds.push({
            item_id: item.id,
            brand: item.brand,
            category_name: category?.name || 'Unknown',
            threshold: item.threshold,
            par_level: item.par_level,
            current_stock: totalStock,
            needed_quantity: needed,
            supplier_id: item.supplier_id,
            supplier_name: supplier?.name || null,
            supplier_email: supplier?.email || null,
            price_per_item: itemPrice,
            total_value: totalValue,
            rooms_with_stock: roomsWithStock
          });
        }
      });

      // Group by supplier
      const supplierGroupsMap = new Map<string, any>();

      orderNeeds.forEach((item) => {
        const supplierId = item.supplier_id?.toString() || 'no-supplier';

        if (!supplierGroupsMap.has(supplierId)) {
          supplierGroupsMap.set(supplierId, {
            supplier_id: item.supplier_id,
            supplier_name: item.supplier_name || 'No Supplier Assigned',
            supplier_email: item.supplier_email,
            items: [],
            total_items: 0,
            total_units: 0,
            total_value: 0
          });
        }

        const group = supplierGroupsMap.get(supplierId)!;
        group.items.push(item);
        group.total_items++;
        group.total_units += item.needed_quantity;
        group.total_value += item.total_value;
      });

      // Convert to array and sort items within each group
      const groups = Array.from(supplierGroupsMap.values());
      groups.forEach((group) => {
        group.items.sort((a: any, b: any) => {
          if (a.category_name !== b.category_name) {
            return a.category_name.localeCompare(b.category_name);
          }
          return a.brand.localeCompare(b.brand);
        });
      });

      // Sort groups: suppliers with email first, then by name
      groups.sort((a, b) => {
        if (a.supplier_email && !b.supplier_email) return -1;
        if (!a.supplier_email && b.supplier_email) return 1;
        return a.supplier_name.localeCompare(b.supplier_name);
      });

      // Calculate summary stats
      const stats = {
        totalItems: orderNeeds.length,
        totalUnits: orderNeeds.reduce((sum, item) => sum + item.needed_quantity, 0),
        totalValue: orderNeeds.reduce((sum, item) => sum + item.total_value, 0),
        suppliersAffected: groups.length
      };

      setOrderGroups(groups);
      setSummaryStats(stats);
    } catch (error) {
      console.error('Error generating order report:', error);
      Alert.alert('Error', 'Failed to generate order report');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user.id]);

  useEffect(() => {
    generateOrderReport();
  }, [generateOrderReport]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    generateOrderReport();
  }, [generateOrderReport]);

  const toggleSupplier = (supplierId: string) => {
    const newExpanded = new Set(expandedSuppliers);
    if (newExpanded.has(supplierId)) {
      newExpanded.delete(supplierId);
    } else {
      newExpanded.add(supplierId);
    }
    setExpandedSuppliers(newExpanded);
  };

  const exportToCSV = useCallback(async () => {
    try {
      // Generate CSV content
      const headers = ['Supplier', 'Category', 'Brand', 'Current Stock', 'Threshold', 'Par Level', 'Order Quantity', 'Price per Item', 'Total Value', 'Room Locations'];
      const rows: string[] = [headers.join(',')];

      orderGroups.forEach((group) => {
        group.items.forEach((item: any) => {
          const roomLocations = item.rooms_with_stock
            .map((r: any) => `${r.room_name}(${r.count})`)
            .join('; ');

          const row = [
            `"${group.supplier_name}"`,
            `"${item.category_name}"`,
            `"${item.brand}"`,
            item.current_stock,
            item.threshold,
            item.par_level,
            item.needed_quantity,
            item.price_per_item.toFixed(2),
            item.total_value.toFixed(2),
            `"${roomLocations}"`
          ];
          rows.push(row.join(','));
        });
      });

      const csvContent = rows.join('\n');
      const dateStr = new Date().toISOString().split('T')[0];
      const timestamp = Date.now();
      const fileName = `order-report-${dateStr}-${timestamp}.csv`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

      // Write CSV file
      await FileSystem.writeAsStringAsync(fileUri, csvContent);

      // Share the file
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Order Report',
          UTI: 'public.comma-separated-values-text',
        });

        // Clean up file after a delay
        setTimeout(async () => {
          try {
            await FileSystem.deleteAsync(fileUri, { idempotent: true });
          } catch (e) {
            console.log('Could not delete temp file:', e);
          }
        }, 5000);
      } else {
        Alert.alert('Success', `Order report saved to:\n${fileName}`);
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      Alert.alert('Error', 'Failed to export order report');
    }
  }, [orderGroups]);

  // Show shopping cart if requested
  if (showShoppingCart) {
    return <ShoppingCartScreen user={user} onBack={() => setShowShoppingCart(false)} />;
  }

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={styles.loadingText}>Generating order report...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.inventoryHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft color="#f97316" size={20} strokeWidth={2.5} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.inventoryTitle}>Orders</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {summaryStats.totalItems > 0 && (
            <TouchableOpacity onPress={exportToCSV} style={styles.exportButton}>
              <Share2 color="#f97316" size={20} strokeWidth={2.5} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Create Order Button - Prominent */}
      <View style={styles.createOrderButtonContainer}>
        <TouchableOpacity
          style={styles.createOrderButton}
          onPress={() => setShowShoppingCart(true)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#f97316', '#ea580c']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.createOrderGradient}
          >
            <ShoppingCart color="#FFFFFF" size={20} strokeWidth={2.5} />
            <Text style={styles.createOrderButtonText}>Create Custom Order</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Subtitle */}
      <View style={styles.screenSubtitle}>
        <Text style={styles.subtitleText}>Items below threshold that need ordering</Text>
      </View>

      <ScrollView
        style={styles.itemsList}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#f97316" />
        }
      >
        {/* Summary Stats */}
        {summaryStats.totalItems > 0 && (
          <View style={styles.orderSummaryContainer}>
            <View style={styles.orderSummaryRow}>
              <View style={[styles.orderStatCard, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                <Text style={[styles.orderStatValue, { color: '#dc2626' }]}>{summaryStats.totalItems}</Text>
                <Text style={[styles.orderStatLabel, { color: '#991b1b' }]}>Items to Order</Text>
              </View>
              <View style={[styles.orderStatCard, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                <Text style={[styles.orderStatValue, { color: '#ca8a04' }]}>{summaryStats.totalUnits}</Text>
                <Text style={[styles.orderStatLabel, { color: '#854d0e' }]}>Total Units</Text>
              </View>
            </View>
            <View style={styles.orderSummaryRow}>
              <View style={[styles.orderStatCard, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                <Text style={[styles.orderStatValue, { color: '#059669' }]}>
                  ${summaryStats.totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </Text>
                <Text style={[styles.orderStatLabel, { color: '#047857' }]}>Total Value</Text>
              </View>
              <View style={[styles.orderStatCard, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                <Text style={[styles.orderStatValue, { color: '#4f46e5' }]}>{summaryStats.suppliersAffected}</Text>
                <Text style={[styles.orderStatLabel, { color: '#3730a3' }]}>Suppliers</Text>
              </View>
            </View>
          </View>
        )}

        {/* No Orders Needed */}
        {orderGroups.length === 0 ? (
          <View style={styles.emptyState}>
            <CheckCircle color="#16a34a" size={64} strokeWidth={1.5} />
            <Text style={styles.emptyStateTitle}>All Stocked Up!</Text>
            <Text style={styles.emptyStateText}>
              No items are currently below their threshold levels
            </Text>
          </View>
        ) : (
          /* Supplier Groups */
          <View style={styles.orderGroupsContainer}>
            {orderGroups.map((group) => {
              const supplierId = group.supplier_id?.toString() || 'no-supplier';
              const isExpanded = expandedSuppliers.has(supplierId);

              return (
                <View key={supplierId} style={styles.orderSupplierCard}>
                  {/* Supplier Header */}
                  <TouchableOpacity
                    style={styles.orderSupplierHeader}
                    onPress={() => toggleSupplier(supplierId)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.orderSupplierName}>{group.supplier_name}</Text>
                      <Text style={styles.orderSupplierSummary}>
                        {group.total_items} items • {group.total_units} units • $
                        {group.total_value.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </Text>
                      {group.supplier_email && (
                        <Text style={styles.orderSupplierEmail}>{group.supplier_email}</Text>
                      )}
                    </View>
                    <ChevronRight
                      color="#9ca3af"
                      size={20}
                      strokeWidth={2}
                      style={{
                        transform: [{ rotate: isExpanded ? '90deg' : '0deg' }]
                      }}
                    />
                  </TouchableOpacity>

                  {/* Expanded Items List */}
                  {isExpanded && (
                    <View style={styles.orderItemsList}>
                      {group.items.map((item: any) => (
                        <View key={item.item_id} style={styles.orderItemCard}>
                          <View style={styles.orderItemHeader}>
                            <Text style={styles.orderItemBrand}>{item.brand}</Text>
                            <Text style={styles.orderItemCategory}>{item.category_name}</Text>
                          </View>

                          <View style={styles.orderItemStats}>
                            <View style={styles.orderItemStat}>
                              <Text style={styles.orderItemStatLabel}>Current</Text>
                              <Text style={[styles.orderItemStatValue, { color: '#dc2626' }]}>
                                {item.current_stock}
                              </Text>
                            </View>
                            <View style={styles.orderItemStat}>
                              <Text style={styles.orderItemStatLabel}>Threshold</Text>
                              <Text style={styles.orderItemStatValue}>{item.threshold}</Text>
                            </View>
                            <View style={styles.orderItemStat}>
                              <Text style={styles.orderItemStatLabel}>Par</Text>
                              <Text style={styles.orderItemStatValue}>{item.par_level}</Text>
                            </View>
                            <View style={styles.orderItemStat}>
                              <Text style={styles.orderItemStatLabel}>Order</Text>
                              <Text style={[styles.orderItemStatValue, { color: '#16a34a', fontWeight: '700' }]}>
                                {item.needed_quantity}
                              </Text>
                            </View>
                          </View>

                          {item.price_per_item > 0 && (
                            <View style={styles.orderItemPrice}>
                              <Text style={styles.orderItemPriceText}>
                                ${item.price_per_item.toFixed(2)} × {item.needed_quantity} = ${item.total_value.toFixed(2)}
                              </Text>
                            </View>
                          )}

                          {item.rooms_with_stock.length > 0 && (
                            <View style={styles.orderItemRooms}>
                              <Text style={styles.orderItemRoomsLabel}>Current Locations:</Text>
                              <Text style={styles.orderItemRoomsText}>
                                {item.rooms_with_stock.map((r: any) => `${r.room_name}(${r.count})`).join(', ')}
                              </Text>
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
});

// Reports & Analytics Screen Component
const ReportsScreen = memo(({ user, onBack }: { user: any; onBack: () => void }) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const screenWidth = Dimensions.get('window').width;

  const getRandomColor = () => {
    const colors = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const generateAnalytics = useCallback(async () => {
    try {
      // Get user's organization
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        setIsLoading(false);
        return;
      }

      const orgId = profile.organization_id;

      // Fetch all data
      const [itemsRes, categoriesRes, suppliersRes, countsRes, roomsRes] = await Promise.all([
        supabase.from('inventory_items').select('*').eq('organization_id', orgId),
        supabase.from('categories').select('*').eq('organization_id', orgId),
        supabase.from('suppliers').select('*').eq('organization_id', orgId),
        supabase.from('room_counts').select('*'),
        supabase.from('rooms').select('*').eq('organization_id', orgId),
      ]);

      const items = itemsRes.data || [];
      const categories = categoriesRes.data || [];
      const suppliers = suppliersRes.data || [];
      const counts = countsRes.data || [];
      const rooms = roomsRes.data || [];

      // Calculate analytics
      const categoryBreakdown = categories.map((cat: any) => {
        const categoryItems = items.filter((item: any) => item.category_id === cat.id);
        const totalValue = categoryItems.reduce((sum: number, item: any) => {
          const itemCounts = counts.filter((c: any) => c.inventory_item_id === item.id);
          const totalCount = itemCounts.reduce((s: number, c: any) => s + c.count, 0);
          return sum + (totalCount * (item.price_per_item || 0));
        }, 0);
        const totalCount = categoryItems.reduce((sum: number, item: any) => {
          const itemCounts = counts.filter((c: any) => c.inventory_item_id === item.id);
          return sum + itemCounts.reduce((s: number, c: any) => s + c.count, 0);
        }, 0);

        return {
          name: cat.name,
          itemCount: categoryItems.length,
          totalValue,
          totalCount,
          color: getRandomColor()
        };
      }).filter((cat: any) => cat.itemCount > 0);

      // Calculate stock levels
      const stockLevels = {
        critical: 0,
        low: 0,
        adequate: 0,
        overstocked: 0
      };

      items.forEach((item: any) => {
        const itemCounts = counts.filter((c: any) => c.inventory_item_id === item.id);
        const totalStock = itemCounts.reduce((s: number, c: any) => s + c.count, 0);

        if (totalStock === 0) {
          stockLevels.critical++;
        } else if (totalStock <= item.threshold) {
          stockLevels.low++;
        } else if (totalStock <= item.par_level) {
          stockLevels.adequate++;
        } else {
          stockLevels.overstocked++;
        }
      });

      // Top suppliers by value
      const supplierValues = suppliers.map((sup: any) => {
        const supplierItems = items.filter((item: any) => item.supplier_id === sup.id);
        const totalValue = supplierItems.reduce((sum: number, item: any) => {
          const itemCounts = counts.filter((c: any) => c.inventory_item_id === item.id);
          const totalCount = itemCounts.reduce((s: number, c: any) => s + c.count, 0);
          return sum + (totalCount * (item.price_per_item || 0));
        }, 0);
        return { name: sup.name, value: totalValue };
      }).filter((s: any) => s.value > 0).sort((a: any, b: any) => b.value - a.value).slice(0, 5);

      // Total inventory value
      const totalInventoryValue = items.reduce((sum: number, item: any) => {
        const itemCounts = counts.filter((c: any) => c.inventory_item_id === item.id);
        const totalCount = itemCounts.reduce((s: number, c: any) => s + c.count, 0);
        return sum + (totalCount * (item.price_per_item || 0));
      }, 0);

      setAnalytics({
        categoryBreakdown,
        stockLevels,
        supplierValues,
        totalInventoryValue,
        totalItems: items.length,
        totalCategories: categories.length,
        totalSuppliers: suppliers.length,
        totalRooms: rooms.length
      });
    } catch (error) {
      console.error('Error generating analytics:', error);
      Alert.alert('Error', 'Failed to generate analytics');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user.id]);

  useEffect(() => {
    generateAnalytics();
  }, [generateAnalytics]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    generateAnalytics();
  }, [generateAnalytics]);

  const exportFullReport = useCallback(async () => {
    if (!analytics) return;

    try {
      const rows: string[] = [];

      // Header section
      rows.push('COMPREHENSIVE INVENTORY REPORT');
      rows.push(`Generated: ${new Date().toLocaleString()}`);
      rows.push('');

      // Summary stats
      rows.push('SUMMARY STATISTICS');
      rows.push(`Total Inventory Value,$${analytics.totalInventoryValue.toFixed(2)}`);
      rows.push(`Total Items,${analytics.totalItems}`);
      rows.push(`Total Categories,${analytics.totalCategories}`);
      rows.push(`Total Suppliers,${analytics.totalSuppliers}`);
      rows.push(`Total Rooms,${analytics.totalRooms}`);
      rows.push('');

      // Category breakdown
      rows.push('CATEGORY BREAKDOWN');
      rows.push('Category,Items,Total Units,Total Value');
      analytics.categoryBreakdown.forEach((cat: any) => {
        rows.push(`"${cat.name}",${cat.itemCount},${cat.totalCount},$${cat.totalValue.toFixed(2)}`);
      });
      rows.push('');

      // Stock levels
      rows.push('STOCK LEVEL ANALYSIS');
      rows.push('Level,Count');
      rows.push(`Critical (Out of Stock),${analytics.stockLevels.critical}`);
      rows.push(`Low (Below Threshold),${analytics.stockLevels.low}`);
      rows.push(`Adequate (Below Par),${analytics.stockLevels.adequate}`);
      rows.push(`Overstocked (Above Par),${analytics.stockLevels.overstocked}`);
      rows.push('');

      // Top suppliers
      rows.push('TOP SUPPLIERS BY VALUE');
      rows.push('Supplier,Total Value');
      analytics.supplierValues.forEach((sup: any) => {
        rows.push(`"${sup.name}",$${sup.value.toFixed(2)}`);
      });

      const csvContent = rows.join('\n');
      const dateStr = new Date().toISOString().split('T')[0];
      const timestamp = Date.now();
      const fileName = `inventory-analytics-${dateStr}-${timestamp}.csv`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, csvContent);

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Analytics Report',
          UTI: 'public.comma-separated-values-text',
        });

        // Clean up file after a delay
        setTimeout(async () => {
          try {
            await FileSystem.deleteAsync(fileUri, { idempotent: true });
          } catch (e) {
            console.log('Could not delete temp file:', e);
          }
        }, 5000);
      } else {
        Alert.alert('Success', `Report saved to:\n${fileName}`);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      Alert.alert('Error', 'Failed to export report');
    }
  }, [analytics]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={styles.loadingText}>Generating analytics...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.inventoryHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft color="#f97316" size={20} strokeWidth={2.5} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.inventoryTitle}>Reports & Analytics</Text>
        <TouchableOpacity onPress={exportFullReport} style={styles.exportButton}>
          <Share2 color="#f97316" size={20} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.itemsList}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#f97316" />
        }
      >
        {/* Summary Cards */}
        <View style={styles.reportSummaryGrid}>
          <View style={[styles.reportSummaryCard, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
            <DollarSign color="#16a34a" size={24} strokeWidth={2} />
            <Text style={[styles.reportSummaryValue, { color: '#16a34a' }]}>
              ${analytics?.totalInventoryValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </Text>
            <Text style={styles.reportSummaryLabel}>Total Value</Text>
          </View>
          <View style={[styles.reportSummaryCard, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
            <Package color="#2563eb" size={24} strokeWidth={2} />
            <Text style={[styles.reportSummaryValue, { color: '#2563eb' }]}>{analytics?.totalItems}</Text>
            <Text style={styles.reportSummaryLabel}>Total Items</Text>
          </View>
          <View style={[styles.reportSummaryCard, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
            <Building2 color="#ca8a04" size={24} strokeWidth={2} />
            <Text style={[styles.reportSummaryValue, { color: '#ca8a04' }]}>{analytics?.totalRooms}</Text>
            <Text style={styles.reportSummaryLabel}>Rooms</Text>
          </View>
          <View style={[styles.reportSummaryCard, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
            <Users color="#7c3aed" size={24} strokeWidth={2} />
            <Text style={[styles.reportSummaryValue, { color: '#7c3aed' }]}>{analytics?.totalSuppliers}</Text>
            <Text style={styles.reportSummaryLabel}>Suppliers</Text>
          </View>
        </View>

        {/* Category Value Breakdown */}
        {analytics?.categoryBreakdown && analytics.categoryBreakdown.length > 0 && (
          <View style={styles.reportChartSection}>
            <Text style={styles.reportSectionTitle}>Value by Category</Text>
            <View style={styles.reportChartContainer}>
              <PieChart
                data={analytics.categoryBreakdown.map((cat: any, index: number) => ({
                  name: cat.name,
                  population: cat.totalValue,
                  color: cat.color,
                  legendFontColor: '#FFFFFF',
                  legendFontSize: 12
                }))}
                width={screenWidth - 48}
                height={220}
                chartConfig={{
                  color: (opacity = 1) => `rgba(249, 115, 22, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </View>
          </View>
        )}

        {/* Stock Levels Bar Chart */}
        {analytics?.stockLevels && (
          <View style={styles.reportChartSection}>
            <Text style={styles.reportSectionTitle}>Stock Level Distribution</Text>
            <View style={styles.reportChartContainer}>
              <BarChart
                data={{
                  labels: ['Critical', 'Low', 'Adequate', 'Over'],
                  datasets: [{
                    data: [
                      analytics.stockLevels.critical,
                      analytics.stockLevels.low,
                      analytics.stockLevels.adequate,
                      analytics.stockLevels.overstocked
                    ]
                  }]
                }}
                width={screenWidth - 48}
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Translucent glass
                  backgroundGradientFrom: '#fff',
                  backgroundGradientTo: '#fff',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(249, 115, 22, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(31, 41, 55, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForLabels: {
                    fontSize: 12
                  }
                }}
                style={{
                  borderRadius: 16
                }}
              />
            </View>
          </View>
        )}

        {/* Category Details Table */}
        {analytics?.categoryBreakdown && (
          <View style={styles.reportTableSection}>
            <Text style={styles.reportSectionTitle}>Category Breakdown</Text>
            {analytics.categoryBreakdown.map((cat: any, index: number) => (
              <View key={index} style={styles.reportTableRow}>
                <View style={styles.reportTableCell}>
                  <View style={[styles.reportColorDot, { backgroundColor: cat.color }]} />
                  <Text style={styles.reportTableCellText}>{cat.name}</Text>
                </View>
                <View style={styles.reportTableCellRight}>
                  <Text style={styles.reportTableValue}>{cat.itemCount} items</Text>
                  <Text style={styles.reportTableSubvalue}>${cat.totalValue.toLocaleString()}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Top Suppliers */}
        {analytics?.supplierValues && analytics.supplierValues.length > 0 && (
          <View style={styles.reportTableSection}>
            <Text style={styles.reportSectionTitle}>Top Suppliers by Value</Text>
            {analytics.supplierValues.map((sup: any, index: number) => (
              <View key={index} style={styles.reportTableRow}>
                <View style={styles.reportTableCell}>
                  <View style={styles.reportRank}>
                    <Text style={styles.reportRankText}>#{index + 1}</Text>
                  </View>
                  <Text style={styles.reportTableCellText}>{sup.name}</Text>
                </View>
                <View style={styles.reportTableCellRight}>
                  <Text style={styles.reportTableValue}>${sup.value.toLocaleString()}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Stock Status Summary */}
        <View style={styles.reportTableSection}>
          <Text style={styles.reportSectionTitle}>Stock Status Overview</Text>
          <View style={styles.reportStockGrid}>
            <View style={[styles.reportStockCard, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
              <AlertTriangle color="#dc2626" size={20} strokeWidth={2} />
              <Text style={[styles.reportStockValue, { color: '#dc2626' }]}>{analytics?.stockLevels.critical}</Text>
              <Text style={styles.reportStockLabel}>Critical</Text>
            </View>
            <View style={[styles.reportStockCard, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
              <TrendingDown color="#ca8a04" size={20} strokeWidth={2} />
              <Text style={[styles.reportStockValue, { color: '#ca8a04' }]}>{analytics?.stockLevels.low}</Text>
              <Text style={styles.reportStockLabel}>Low Stock</Text>
            </View>
            <View style={[styles.reportStockCard, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
              <CheckCircle color="#16a34a" size={20} strokeWidth={2} />
              <Text style={[styles.reportStockValue, { color: '#16a34a' }]}>{analytics?.stockLevels.adequate}</Text>
              <Text style={styles.reportStockLabel}>Adequate</Text>
            </View>
            <View style={[styles.reportStockCard, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
              <TrendingUp color="#2563eb" size={20} strokeWidth={2} />
              <Text style={[styles.reportStockValue, { color: '#2563eb' }]}>{analytics?.stockLevels.overstocked}</Text>
              <Text style={styles.reportStockLabel}>Overstocked</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
});

// Helper function for time ago display
const getTimeAgo = (date: Date) => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

// PIN Entry Screen Component
const PINEntryScreen = memo(({
  movementType,
  onBack,
  onPINVerified
}: {
  movementType: 'IN' | 'OUT';
  onBack: () => void;
  onPINVerified: (userId: string, userName: string) => void;
}) => {
  const [pin, setPin] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleNumberPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError('');

      // Auto-verify when 4 digits entered
      if (newPin.length === 4) {
        verifyPIN(newPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const verifyPIN = async (pinToVerify: string) => {
    try {
      setIsVerifying(true);
      setError('');

      // Hash the PIN (in production, use proper hashing like bcrypt)
      // For now, we'll just compare directly - you should hash this!
      const { data: users, error } = await supabase
        .from('user_profiles')
        .select('id, email, full_name, pin_code')
        .eq('pin_code', pinToVerify);

      if (error) {
        console.error('Error verifying PIN:', error);
        setError('Verification error');
        setPin('');
        setIsVerifying(false);
        return;
      }

      if (users && users.length > 0) {
        // PIN is valid - use full_name or email as fallback
        const userName = users[0].full_name || users[0].email?.split('@')[0] || users[0].email || 'User';
        onPINVerified(users[0].id, userName);
      } else {
        // Invalid PIN
        setError('Invalid PIN');
        setPin('');
      }

      setIsVerifying(false);
    } catch (error) {
      console.error('Error verifying PIN:', error);
      setError('Verification error');
      setPin('');
      setIsVerifying(false);
    }
  };

  const isStockIn = movementType === 'IN';
  const accentColor = isStockIn ? '#10B981' : '#EF4444';

  return (
    <View style={[styles.container, { backgroundColor: '#0B0B0C' }]}>
      {/* Header */}
      <View style={[styles.screenHeader, { paddingTop: 60 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft color="#FFFFFF" size={24} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Enter PIN</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={{ flex: 1, justifyContent: 'space-between', paddingBottom: 40 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          {/* Header Badge */}
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: accentColor + '20',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16
            }}>
              {isStockIn ? (
                <Plus color={accentColor} size={40} strokeWidth={2.5} />
              ) : (
                <Minus color={accentColor} size={40} strokeWidth={2.5} />
              )}
            </View>
            <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', marginBottom: 4 }}>
              Stock {movementType}
            </Text>
            <Text style={{ color: '#9ca3af', fontSize: 14 }}>
              Enter your 4-digit PIN
            </Text>
          </View>

          {/* PIN Display */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 32 }}>
            {[0, 1, 2, 3].map((index) => (
              <View
                key={index}
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: pin.length > index ? accentColor : '#2a2a2c',
                  borderWidth: 2,
                  borderColor: pin.length > index ? accentColor : '#404040'
                }}
              />
            ))}
          </View>

          {/* Error Message */}
          {error ? (
            <View style={{ backgroundColor: '#EF444420', borderRadius: 8, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#EF4444', marginHorizontal: 20 }}>
              <Text style={{ color: '#EF4444', fontSize: 14, textAlign: 'center' }}>{error}</Text>
            </View>
          ) : null}

          {/* Verifying Message */}
          {isVerifying ? (
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <ActivityIndicator color={accentColor} />
              <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 8 }}>Verifying PIN...</Text>
            </View>
          ) : null}
        </View>

        {/* Number Pad */}
        <View style={{ paddingHorizontal: 40 }}>
          <View style={{ gap: 12 }}>
            {/* Row 1: 1, 2, 3 */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {[1, 2, 3].map((num) => (
                <TouchableOpacity
                  key={num}
                  onPress={() => handleNumberPress(num.toString())}
                  disabled={isVerifying}
                  style={{
                    flex: 1,
                    height: 70,
                    backgroundColor: '#1a1a1c',
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: '#2a2a2c'
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: '600' }}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Row 2: 4, 5, 6 */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {[4, 5, 6].map((num) => (
                <TouchableOpacity
                  key={num}
                  onPress={() => handleNumberPress(num.toString())}
                  disabled={isVerifying}
                  style={{
                    flex: 1,
                    height: 70,
                    backgroundColor: '#1a1a1c',
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: '#2a2a2c'
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: '600' }}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Row 3: 7, 8, 9 */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {[7, 8, 9].map((num) => (
                <TouchableOpacity
                  key={num}
                  onPress={() => handleNumberPress(num.toString())}
                  disabled={isVerifying}
                  style={{
                    flex: 1,
                    height: 70,
                    backgroundColor: '#1a1a1c',
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: '#2a2a2c'
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: '600' }}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Row 4: CLR, 0, ← */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={handleClear}
                disabled={isVerifying || pin.length === 0}
                style={{
                  flex: 1,
                  height: 70,
                  backgroundColor: '#1a1a1c',
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: '#2a2a2c',
                  opacity: pin.length === 0 ? 0.5 : 1
                }}
              >
                <Text style={{ color: '#9ca3af', fontSize: 14, fontWeight: '600' }}>CLR</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleNumberPress('0')}
                disabled={isVerifying}
                style={{
                  flex: 1,
                  height: 70,
                  backgroundColor: '#1a1a1c',
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: '#2a2a2c'
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: '600' }}>0</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleBackspace}
                disabled={isVerifying || pin.length === 0}
                style={{
                  flex: 1,
                  height: 70,
                  backgroundColor: '#1a1a1c',
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: '#2a2a2c',
                  opacity: pin.length === 0 ? 0.5 : 1
                }}
              >
                <Text style={{ color: '#9ca3af', fontSize: 24 }}>←</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Help Text */}
          <View style={{ marginTop: 32, alignItems: 'center' }}>
            <Text style={{ color: '#6b7280', fontSize: 12, textAlign: 'center' }}>
              Don't have a PIN? Contact your manager
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
});

// Stock Entry Screen Component with Cart
const StockEntryScreen = memo(({
  user,
  movementType,
  verifiedUser,
  onBack,
  onComplete
}: {
  user: any;
  movementType: 'IN' | 'OUT';
  verifiedUser: { id: string; name: string };
  onBack: () => void;
  onComplete: () => void;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentStock, setCurrentStock] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
  const [rooms, setRooms] = useState<any[]>([]);

  // Cart state - array of items to be saved
  const [cart, setCart] = useState<Array<{
    item: any;
    quantity: number;
    notes: string;
    currentStock: number;
    room: any;
  }>>([]);

  const isStockIn = movementType === 'IN';
  const accentColor = isStockIn ? '#10B981' : '#EF4444';

  // Fetch rooms for the organization
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (profile?.organization_id) {
        const { data: roomsData } = await supabase
          .from('rooms')
          .select('*')
          .eq('organization_id', profile.organization_id)
          .order('name');

        if (roomsData && roomsData.length > 0) {
          setRooms(roomsData);
          setSelectedRoom(roomsData[0]); // Default to first room
        }
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  // Search for items as user types
  useEffect(() => {
    if (searchQuery.length > 1) {
      searchItems();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const searchItems = async () => {
    try {
      setIsSearching(true);

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) return;

      const { data: items } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .or(`brand.ilike.%${searchQuery}%,barcode.eq.${searchQuery}`)
        .limit(10);

      setSearchResults(items || []);
      setIsSearching(false);
    } catch (error) {
      console.error('Error searching items:', error);
      setIsSearching(false);
    }
  };

  const handleItemSelect = async (item: any) => {
    setSelectedItem(item);
    setSearchQuery(item.brand);
    setSearchResults([]);

    // Fetch current stock for this item in selected room
    if (selectedRoom) {
      const { data: roomCount } = await supabase
        .from('room_counts')
        .select('count')
        .eq('inventory_item_id', item.id)
        .eq('room_id', selectedRoom.id)
        .single();

      setCurrentStock(roomCount?.count || 0);
    }
  };

  const handleAddToCart = () => {
    if (!selectedItem || !selectedRoom) return;

    // Add item to cart
    setCart([...cart, {
      item: selectedItem,
      quantity: quantity,
      notes: notes,
      currentStock: currentStock,
      room: selectedRoom
    }]);

    // Reset form for next item
    setSelectedItem(null);
    setSearchQuery('');
    setQuantity(1);
    setNotes('');
    setCurrentStock(0);
  };

  const handleRemoveFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const handleSaveAll = async () => {
    if (cart.length === 0) return;

    try {
      setIsSaving(true);

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) return;

      // Create array of movements to insert
      const movements = cart.map(cartItem => {
        const newStock = isStockIn
          ? cartItem.currentStock + cartItem.quantity
          : cartItem.currentStock - cartItem.quantity;

        return {
          inventory_item_id: cartItem.item.id,
          item_brand: cartItem.item.brand,
          item_size: cartItem.item.size,
          user_id: verifiedUser.id,
          user_name: verifiedUser.name,
          movement_type: movementType,
          quantity: cartItem.quantity,
          previous_stock: cartItem.currentStock,
          new_stock: newStock,
          room_id: cartItem.room.id,
          room_name: cartItem.room.name,
          notes: cartItem.notes || null,
          organization_id: profile.organization_id
        };
      });

      // Insert all movements at once
      const { error } = await supabase
        .from('stock_movements')
        .insert(movements);

      if (error) {
        console.error('Error saving stock movements:', error);
        alert('Error saving stock movements');
        setIsSaving(false);
        return;
      }

      // Success - go back to main screen
      setIsSaving(false);
      onComplete();
    } catch (error) {
      console.error('Error saving stock movements:', error);
      alert('Error saving stock movements');
      setIsSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: '#0B0B0C' }]}>
      <View style={[styles.screenHeader, { paddingTop: 60 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft color="#FFFFFF" size={24} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Stock {movementType}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {/* User Badge */}
        <View style={{ backgroundColor: accentColor + '20', borderRadius: 8, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: accentColor }}>
          <Text style={{ color: accentColor, fontSize: 12, fontWeight: '600' }}>Logged in as {verifiedUser.name}</Text>
        </View>

        {/* Cart Summary */}
        {cart.length > 0 && (
          <View style={{ backgroundColor: '#1a1a1c', borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 2, borderColor: accentColor }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>Cart ({cart.length} items)</Text>
              <Text style={{ color: accentColor, fontSize: 14, fontWeight: '600' }}>
                Total: {isStockIn ? '+' : '-'}{cart.reduce((sum, item) => sum + item.quantity, 0)}
              </Text>
            </View>

            {/* Cart Items */}
            {cart.map((cartItem, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: '#0B0B0C',
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 8,
                  borderLeftWidth: 3,
                  borderLeftColor: accentColor
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600', flex: 1 }}>
                    {cartItem.item.brand}
                  </Text>
                  <TouchableOpacity onPress={() => handleRemoveFromCart(index)} style={{ marginLeft: 8 }}>
                    <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: '600' }}>Remove</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#6b7280', fontSize: 12 }}>
                    {cartItem.room.name} • Qty: {isStockIn ? '+' : '-'}{cartItem.quantity}
                  </Text>
                  <Text style={{ color: '#9ca3af', fontSize: 12 }}>
                    {cartItem.currentStock} → {isStockIn ? cartItem.currentStock + cartItem.quantity : cartItem.currentStock - cartItem.quantity}
                  </Text>
                </View>
                {cartItem.notes && (
                  <Text style={{ color: '#6b7280', fontSize: 11, marginTop: 4, fontStyle: 'italic' }}>
                    {cartItem.notes}
                  </Text>
                )}
              </View>
            ))}

            {/* Confirm All Button */}
            <TouchableOpacity
              onPress={handleSaveAll}
              disabled={isSaving}
              style={{
                backgroundColor: accentColor,
                borderRadius: 8,
                padding: 14,
                alignItems: 'center',
                marginTop: 8
              }}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' }}>
                  Confirm All {cart.length} Items
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Room Selection */}
        {rooms.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: '#9ca3af', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>ROOM</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', gap: 8 }}>
              {rooms.map((room) => (
                <TouchableOpacity
                  key={room.id}
                  onPress={() => {
                    setSelectedRoom(room);
                    if (selectedItem) {
                      handleItemSelect(selectedItem);
                    }
                  }}
                  style={{
                    backgroundColor: selectedRoom?.id === room.id ? accentColor : '#1a1a1c',
                    borderRadius: 8,
                    padding: 12,
                    marginRight: 8,
                    borderWidth: 1,
                    borderColor: selectedRoom?.id === room.id ? accentColor : '#2a2a2c'
                  }}
                >
                  <Text style={{ color: selectedRoom?.id === room.id ? '#FFFFFF' : '#9ca3af', fontSize: 14, fontWeight: '600' }}>
                    {room.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Search Input */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: '#9ca3af', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>SEARCH ITEM OR SCAN BARCODE</Text>
          <TextInput
            style={{
              backgroundColor: '#1a1a1c',
              borderRadius: 8,
              padding: 14,
              color: '#FFFFFF',
              fontSize: 16,
              borderWidth: 1,
              borderColor: '#2a2a2c'
            }}
            placeholder="Type brand name or scan barcode..."
            placeholderTextColor="#6b7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: '#9ca3af', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>RESULTS</Text>
            {searchResults.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleItemSelect(item)}
                style={{
                  backgroundColor: '#1a1a1c',
                  borderRadius: 8,
                  padding: 14,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: '#2a2a2c'
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>{item.brand}</Text>
                <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 4 }}>{item.category_name} • {item.size}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Selected Item */}
        {selectedItem && (
          <>
            <View style={{ backgroundColor: '#1a1a1c', borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: accentColor }}>
              <Text style={{ color: '#9ca3af', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>SELECTED ITEM</Text>
              <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }}>{selectedItem.brand}</Text>
              <Text style={{ color: '#9ca3af', fontSize: 14, marginTop: 4 }}>{selectedItem.size}</Text>
              <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#2a2a2c' }}>
                <Text style={{ color: '#6b7280', fontSize: 12 }}>Current stock in {selectedRoom?.name || 'room'}</Text>
                <Text style={{ color: '#f97316', fontSize: 24, fontWeight: 'bold', marginTop: 4 }}>{currentStock}</Text>
              </View>
            </View>

            {/* Quantity */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: '#9ca3af', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>QUANTITY</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <TouchableOpacity
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{
                    width: 50,
                    height: 50,
                    backgroundColor: '#1a1a1c',
                    borderRadius: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: '#2a2a2c'
                  }}
                >
                  <Minus color="#FFFFFF" size={20} strokeWidth={2} />
                </TouchableOpacity>

                <View style={{
                  flex: 1,
                  backgroundColor: '#1a1a1c',
                  borderRadius: 8,
                  padding: 14,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#2a2a2c'
                }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 32, fontWeight: 'bold' }}>{quantity}</Text>
                </View>

                <TouchableOpacity
                  onPress={() => setQuantity(quantity + 1)}
                  style={{
                    width: 50,
                    height: 50,
                    backgroundColor: '#1a1a1c',
                    borderRadius: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: '#2a2a2c'
                  }}
                >
                  <Plus color="#FFFFFF" size={20} strokeWidth={2} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Notes */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: '#9ca3af', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>NOTES (OPTIONAL)</Text>
              <TextInput
                style={{
                  backgroundColor: '#1a1a1c',
                  borderRadius: 8,
                  padding: 14,
                  color: '#FFFFFF',
                  fontSize: 14,
                  borderWidth: 1,
                  borderColor: '#2a2a2c',
                  minHeight: 80,
                  textAlignVertical: 'top'
                }}
                placeholder="Add notes about this stock movement..."
                placeholderTextColor="#6b7280"
                value={notes}
                onChangeText={setNotes}
                multiline
              />
            </View>

            {/* Summary */}
            <View style={{ backgroundColor: '#1a1a1c', borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <Text style={{ color: '#9ca3af', fontSize: 12, fontWeight: '600', marginBottom: 12 }}>SUMMARY</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: '#6b7280', fontSize: 14 }}>Current Stock</Text>
                <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>{currentStock}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: '#6b7280', fontSize: 14 }}>{isStockIn ? 'Adding' : 'Removing'}</Text>
                <Text style={{ color: accentColor, fontSize: 14, fontWeight: '600' }}>{isStockIn ? '+' : '-'}{quantity}</Text>
              </View>
              <View style={{ height: 1, backgroundColor: '#2a2a2c', marginVertical: 8 }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>New Stock</Text>
                <Text style={{ color: '#f97316', fontSize: 16, fontWeight: 'bold' }}>
                  {isStockIn ? currentStock + quantity : currentStock - quantity}
                </Text>
              </View>
            </View>

            {/* Add to Cart Button */}
            <TouchableOpacity
              onPress={handleAddToCart}
              style={{
                backgroundColor: accentColor,
                borderRadius: 12,
                padding: 18,
                alignItems: 'center',
                marginBottom: 40
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>
                Add to Cart
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
});

// Stock Movement Screen Component
const StockMovementScreen = memo(({ user, onBack }: { user: any; onBack: () => void }) => {
  const [movements, setMovements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [todayStats, setTodayStats] = useState({ in: 0, out: 0, total: 0 });
  const [currentView, setCurrentView] = useState<'main' | 'pin' | 'entry'>('main');
  const [movementType, setMovementType] = useState<'IN' | 'OUT'>('IN');
  const [verifiedUser, setVerifiedUser] = useState<{ id: string; name: string } | null>(null);

  // Fetch real stock movements from database
  useEffect(() => {
    fetchStockMovements();
  }, []);

  const fetchStockMovements = async () => {
    try {
      setIsLoading(true);

      // Get user's organization
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        setIsLoading(false);
        return;
      }

      // Fetch stock movements from today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: stockMovements, error } = await supabase
        .from('stock_movements')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching stock movements:', error);
        setIsLoading(false);
        return;
      }

      setMovements(stockMovements || []);

      // Calculate today's stats
      const stats = (stockMovements || []).reduce((acc, movement) => {
        if (movement.movement_type === 'IN') {
          acc.in += movement.quantity;
        } else {
          acc.out += movement.quantity;
        }
        acc.total += movement.quantity;
        return acc;
      }, { in: 0, out: 0, total: 0 });

      setTodayStats(stats);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching stock movements:', error);
      setIsLoading(false);
    }
  };

  const handleStockInPress = () => {
    setMovementType('IN');
    setCurrentView('pin');
  };

  const handleStockOutPress = () => {
    setMovementType('OUT');
    setCurrentView('pin');
  };

  const handlePINVerified = (userId: string, userName: string) => {
    setVerifiedUser({ id: userId, name: userName });
    setCurrentView('entry');
  };

  const handleBackFromPIN = () => {
    setCurrentView('main');
    setVerifiedUser(null);
  };

  // Show PIN screen if needed
  if (currentView === 'pin') {
    return (
      <PINEntryScreen
        movementType={movementType}
        onBack={handleBackFromPIN}
        onPINVerified={handlePINVerified}
      />
    );
  }

  // Show entry screen if needed
  if (currentView === 'entry' && verifiedUser) {
    return (
      <StockEntryScreen
        user={user}
        movementType={movementType}
        verifiedUser={verifiedUser}
        onBack={handleBackFromPIN}
        onComplete={() => {
          // Refresh movements and go back to main
          setCurrentView('main');
          setVerifiedUser(null);
          fetchStockMovements();
        }}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#0B0B0C' }]}>
      {/* Header with more spacing */}
      <View style={[styles.screenHeader, { paddingTop: 60 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft color="#FFFFFF" size={24} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Stock Movements</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Real Data Content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {/* Action Buttons - Now Pressable */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
          <TouchableOpacity onPress={handleStockInPress} style={{ flex: 1, backgroundColor: '#10B981', borderRadius: 12, padding: 20, alignItems: 'center' }}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Plus color="#FFFFFF" size={28} strokeWidth={2.5} />
            </View>
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>STOCK IN</Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4 }}>Log Deliveries</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleStockOutPress} style={{ flex: 1, backgroundColor: '#EF4444', borderRadius: 12, padding: 20, alignItems: 'center' }}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Minus color="#FFFFFF" size={28} strokeWidth={2.5} />
            </View>
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>STOCK OUT</Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4 }}>Bar Restocking</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats - Real Data */}
        <View style={{ backgroundColor: '#1a1a1c', borderRadius: 12, padding: 16, marginBottom: 24 }}>
          <Text style={{ color: '#9ca3af', fontSize: 12, fontWeight: '600', marginBottom: 12 }}>TODAY'S ACTIVITY</Text>
          {isLoading ? (
            <ActivityIndicator color="#f97316" />
          ) : (
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: '#10B981', fontSize: 24, fontWeight: 'bold' }}>{todayStats.in}</Text>
                <Text style={{ color: '#6b7280', fontSize: 12 }}>IN</Text>
              </View>
              <View style={{ width: 1, backgroundColor: '#2a2a2c' }} />
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: '#EF4444', fontSize: 24, fontWeight: 'bold' }}>{todayStats.out}</Text>
                <Text style={{ color: '#6b7280', fontSize: 12 }}>OUT</Text>
              </View>
              <View style={{ width: 1, backgroundColor: '#2a2a2c' }} />
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: '#f97316', fontSize: 24, fontWeight: 'bold' }}>{todayStats.total}</Text>
                <Text style={{ color: '#6b7280', fontSize: 12 }}>TOTAL</Text>
              </View>
            </View>
          )}
        </View>

        {/* Recent Activity - Real Data */}
        <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>Recent Activity</Text>

        {isLoading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator color="#f97316" size="large" />
          </View>
        ) : movements.length === 0 ? (
          <View style={{ backgroundColor: '#1a1a1c', borderRadius: 12, padding: 32, alignItems: 'center', marginBottom: 12 }}>
            <Package color="#6b7280" size={48} strokeWidth={1.5} />
            <Text style={{ color: '#9ca3af', fontSize: 14, marginTop: 12, textAlign: 'center' }}>
              No stock movements today
            </Text>
            <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 4, textAlign: 'center' }}>
              Use the buttons above to log stock IN or OUT
            </Text>
          </View>
        ) : (
          movements.map((movement, index) => {
            const isStockIn = movement.movement_type === 'IN';
            const timeAgo = getTimeAgo(new Date(movement.created_at));

            return (
              <View
                key={movement.id}
                style={{
                  backgroundColor: '#1a1a1c',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  borderLeftWidth: 4,
                  borderLeftColor: isStockIn ? '#10B981' : '#EF4444'
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>
                    {movement.item_brand} {movement.item_size || ''}
                  </Text>
                  <Text style={{
                    color: isStockIn ? '#10B981' : '#EF4444',
                    fontSize: 14,
                    fontWeight: 'bold'
                  }}>
                    {isStockIn ? '+' : '-'}{movement.quantity}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#6b7280', fontSize: 12 }}>by {movement.user_name}</Text>
                  <Text style={{ color: '#6b7280', fontSize: 12 }}>{timeAgo}</Text>
                </View>
                {movement.notes && (
                  <Text style={{ color: '#9ca3af', fontSize: 11, marginTop: 6, fontStyle: 'italic' }}>
                    {movement.notes}
                  </Text>
                )}
              </View>
            );
          })
        )}

        {/* Coming Soon Badge */}
        <View style={{ marginTop: 20, alignItems: 'center', padding: 20, backgroundColor: 'rgba(249, 115, 22, 0.1)', borderRadius: 12, borderWidth: 1, borderColor: '#f97316', borderStyle: 'dashed' }}>
          <Text style={{ color: '#f97316', fontSize: 14, fontWeight: 'bold' }}>Building Real Feature</Text>
          <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 4, textAlign: 'center' }}>
            Currently showing real data from database. Stock IN/OUT functionality coming next!
          </Text>
        </View>
      </ScrollView>
    </View>
  );
});

// Team & PINs Screen Component
const TeamPINScreen = memo(({ user, userProfile, onBack }: { user: any; userProfile: any; onBack: () => void }) => {
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPINs, setShowPINs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (profile) {
        const { data: members } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('organization_id', profile.organization_id)
          .order('created_at', { ascending: true });

        setTeamMembers(members || []);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePINVisibility = (userId: string) => {
    setShowPINs(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  return (
    <View style={styles.container}>
      {/* Modern Header */}
      <View style={styles.modernScreenHeader}>
        <TouchableOpacity onPress={onBack} style={styles.modernBackButton}>
          <ArrowLeft color="#1A1A1A" size={24} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.modernHeaderCenter}>
          <Text style={styles.modernScreenTitle}>Team & PINs</Text>
          <Text style={styles.modernScreenSubtitle}>View team members and PINs</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }}>
          <View style={{ padding: 20 }}>
            {/* Team Members List */}
            {teamMembers.map((member, index) => (
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
                    <Text style={{ fontSize: 13, color: '#6B7280' }}>
                      {member.email}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
                      {member.role || 'team_member'}
                    </Text>
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
                      {showPINs[member.id] ? member.pin_code : '••••'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => togglePINVisibility(member.id)}
                    style={{
                      padding: 4
                    }}
                  >
                    <Text style={{ fontSize: 12, color: '#F97316', fontWeight: '600' }}>
                      {showPINs[member.id] ? 'Hide' : 'Show'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {teamMembers.length === 0 && (
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

// Stock Analytics Screen Component
const StockAnalyticsScreen = memo(({ user, userProfile, onBack }: { user: any; userProfile: any; onBack: () => void }) => {
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalIN: 0,
    totalOUT: 0,
    netChange: 0,
    totalMovements: 0
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (profile) {
        const { data: movementsData } = await supabase
          .from('stock_movements')
          .select('*')
          .eq('organization_id', profile.organization_id)
          .order('created_at', { ascending: false })
          .limit(100);

        if (movementsData) {
          setMovements(movementsData);

          const totalIN = movementsData
            .filter(m => m.movement_type === 'IN')
            .reduce((sum, m) => sum + m.quantity, 0);

          const totalOUT = movementsData
            .filter(m => m.movement_type === 'OUT')
            .reduce((sum, m) => sum + m.quantity, 0);

          setStats({
            totalIN,
            totalOUT,
            netChange: totalIN - totalOUT,
            totalMovements: movementsData.length
          });
        }
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Modern Header */}
      <View style={styles.modernScreenHeader}>
        <TouchableOpacity onPress={onBack} style={styles.modernBackButton}>
          <ArrowLeft color="#1A1A1A" size={24} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.modernHeaderCenter}>
          <Text style={styles.modernScreenTitle}>Stock Analytics</Text>
          <Text style={styles.modernScreenSubtitle}>Movement insights & trends</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }}>
          <View style={{ padding: 20 }}>
            {/* Stats Cards */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
              <View
                style={{
                  flex: 1,
                  minWidth: '45%',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: '#E5E7EB'
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <TrendingUp color="#10B981" size={20} strokeWidth={2} />
                  <Text style={{ fontSize: 12, color: '#6B7280', marginLeft: 6, fontWeight: '500' }}>
                    Stock IN
                  </Text>
                </View>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#10B981' }}>
                  {stats.totalIN}
                </Text>
              </View>

              <View
                style={{
                  flex: 1,
                  minWidth: '45%',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: '#E5E7EB'
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <TrendingDown color="#EF4444" size={20} strokeWidth={2} />
                  <Text style={{ fontSize: 12, color: '#6B7280', marginLeft: 6, fontWeight: '500' }}>
                    Stock OUT
                  </Text>
                </View>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#EF4444' }}>
                  {stats.totalOUT}
                </Text>
              </View>

              <View
                style={{
                  flex: 1,
                  minWidth: '45%',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: '#E5E7EB'
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Activity color="#F97316" size={20} strokeWidth={2} />
                  <Text style={{ fontSize: 12, color: '#6B7280', marginLeft: 6, fontWeight: '500' }}>
                    Net Change
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: stats.netChange >= 0 ? '#10B981' : '#EF4444'
                  }}
                >
                  {stats.netChange >= 0 ? '+' : ''}{stats.netChange}
                </Text>
              </View>

              <View
                style={{
                  flex: 1,
                  minWidth: '45%',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: '#E5E7EB'
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <BarChart3 color="#6366F1" size={20} strokeWidth={2} />
                  <Text style={{ fontSize: 12, color: '#6B7280', marginLeft: 6, fontWeight: '500' }}>
                    Movements
                  </Text>
                </View>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1A1A1A' }}>
                  {stats.totalMovements}
                </Text>
              </View>
            </View>

            {/* Recent Movements */}
            <View style={{ marginTop: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 12 }}>
                Recent Movements
              </Text>
              {movements.slice(0, 20).map((movement, index) => (
                <View
                  key={movement.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 10,
                    padding: 14,
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    borderLeftWidth: 3,
                    borderLeftColor: movement.movement_type === 'IN' ? '#10B981' : '#EF4444'
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: '#1A1A1A', flex: 1 }}>
                      {movement.item_brand}
                    </Text>
                    <View
                      style={{
                        backgroundColor: movement.movement_type === 'IN' ? '#D1FAE5' : '#FEE2E2',
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 12
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: 'bold',
                          color: movement.movement_type === 'IN' ? '#047857' : '#DC2626'
                        }}
                      >
                        {movement.movement_type === 'IN' ? '+' : '-'}{movement.quantity}
                      </Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 12, color: '#6B7280' }}>
                      {movement.user_name}
                    </Text>
                    <Text style={{ fontSize: 11, color: '#9CA3AF' }}>
                      {new Date(movement.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  {movement.room_name && (
                    <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>
                      📍 {movement.room_name}
                    </Text>
                  )}
                </View>
              ))}

              {movements.length === 0 && (
                <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                  <BarChart3 color="#9CA3AF" size={48} strokeWidth={1.5} />
                  <Text style={{ fontSize: 16, color: '#6B7280', marginTop: 12 }}>
                    No movements recorded yet
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
});

// More/Settings Screen Component
const MoreScreen = memo(({ user, userProfile, onLogout, onNavigateToRooms, onNavigateToSuppliers, onNavigateToOrders, onNavigateToReports, onNavigateToTeam, onNavigateToAnalytics, onBack }: { user: any; userProfile: any; onLogout: () => void; onNavigateToRooms: () => void; onNavigateToSuppliers: () => void; onNavigateToOrders: () => void; onNavigateToReports: () => void; onNavigateToTeam: () => void; onNavigateToAnalytics: () => void; onBack: () => void }) => {

  const handleRoomsPress = () => {
    onNavigateToRooms();
  };

  const handleSuppliersPress = () => {
    onNavigateToSuppliers();
  };

  const handleOrdersPress = () => {
    onNavigateToOrders();
  };

  const handleReportsPress = () => {
    onNavigateToReports();
  };

  const handleTeamPress = () => {
    onNavigateToTeam();
  };

  const handleAnalyticsPress = () => {
    onNavigateToAnalytics();
  };

  return (
    <View style={styles.container}>
      {/* Modern Header */}
      <View style={styles.modernScreenHeader}>
        <TouchableOpacity onPress={onBack} style={styles.modernBackButton}>
          <ArrowLeft color="#1A1A1A" size={24} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.modernHeaderCenter}>
          <Text style={styles.modernScreenTitle}>More</Text>
          <Text style={styles.modernScreenSubtitle}>Settings & Options</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.moreScroll}>
        {/* Modern User Info Card */}
        <View style={styles.modernUserCard}>
          <View style={styles.modernUserAvatar}>
            <Text style={styles.modernUserAvatarText}>
              {(userProfile?.full_name || user.email).charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.modernUserInfo}>
            <Text style={styles.modernUserName}>{userProfile?.full_name || user.email}</Text>
            <Text style={styles.modernUserStatus}>Signed In</Text>
          </View>
        </View>

        {/* Modern Menu Sections */}
        <View style={styles.modernMenuSection}>
          <Text style={styles.modernMenuSectionTitle}>Management</Text>
          <View style={styles.modernMenuGroup}>
            <TouchableOpacity style={styles.modernMenuItem} onPress={handleRoomsPress} activeOpacity={0.7}>
              <View style={styles.modernMenuItemLeft}>
                <View style={[styles.modernMenuIcon, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                  <Building2 color="#10B981" size={20} strokeWidth={2.5} />
                </View>
                <Text style={styles.modernMenuItemText}>Rooms</Text>
              </View>
              <ChevronRight color="#9CA3AF" size={20} strokeWidth={2.5} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.modernMenuItem} onPress={handleSuppliersPress} activeOpacity={0.7}>
              <View style={styles.modernMenuItemLeft}>
                <View style={[styles.modernMenuIcon, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                  <Users color="#8B5CF6" size={20} strokeWidth={2.5} />
                </View>
                <Text style={styles.modernMenuItemText}>Suppliers</Text>
              </View>
              <ChevronRight color="#9CA3AF" size={20} strokeWidth={2.5} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.modernMenuItem} onPress={handleOrdersPress} activeOpacity={0.7}>
              <View style={styles.modernMenuItemLeft}>
                <View style={[styles.modernMenuIcon, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                  <DollarSign color="#F59E0B" size={20} strokeWidth={2.5} />
                </View>
                <Text style={styles.modernMenuItemText}>Orders</Text>
              </View>
              <ChevronRight color="#9CA3AF" size={20} strokeWidth={2.5} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.modernMenuItem} onPress={handleReportsPress} activeOpacity={0.7}>
              <View style={styles.modernMenuItemLeft}>
                <View style={[styles.modernMenuIcon, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                  <FileText color="#F97316" size={20} strokeWidth={2.5} />
                </View>
                <Text style={styles.modernMenuItemText}>Reports & Analytics</Text>
              </View>
              <ChevronRight color="#9CA3AF" size={20} strokeWidth={2.5} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.modernMenuItem} onPress={handleTeamPress} activeOpacity={0.7}>
              <View style={styles.modernMenuItemLeft}>
                <View style={[styles.modernMenuIcon, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                  <Shield color="#3B82F6" size={20} strokeWidth={2.5} />
                </View>
                <Text style={styles.modernMenuItemText}>Team & PINs</Text>
              </View>
              <ChevronRight color="#9CA3AF" size={20} strokeWidth={2.5} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.modernMenuItem} onPress={handleAnalyticsPress} activeOpacity={0.7}>
              <View style={styles.modernMenuItemLeft}>
                <View style={[styles.modernMenuIcon, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                  <Activity color="#EC4899" size={20} strokeWidth={2.5} />
                </View>
                <Text style={styles.modernMenuItemText}>Stock Analytics</Text>
              </View>
              <ChevronRight color="#9CA3AF" size={20} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.modernMenuSection}>
          <Text style={styles.modernMenuSectionTitle}>Legal</Text>
          <View style={styles.modernMenuGroup}>
            <TouchableOpacity
              style={styles.modernMenuItem}
              onPress={() => Alert.alert(
                'Privacy Policy',
                'InvyEasy respects your privacy. We collect only essential account and inventory data to provide our service. Your data is encrypted and never shared with third parties. For full details, visit our privacy policy at invyeasy.com/privacy',
                [{ text: 'OK' }]
              )}
              activeOpacity={0.7}
            >
              <View style={styles.modernMenuItemLeft}>
                <View style={[styles.modernMenuIcon, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                  <FileText color="#6B7280" size={20} strokeWidth={2.5} />
                </View>
                <Text style={styles.modernMenuItemText}>Privacy Policy</Text>
              </View>
              <ChevronRight color="#9CA3AF" size={20} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Modern Sign Out Button */}
        <TouchableOpacity style={styles.modernSignOutButton} onPress={onLogout} activeOpacity={0.7}>
          <LogOut color="#EF4444" size={20} strokeWidth={2.5} />
          <Text style={styles.modernSignOutButtonText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.modernAppVersion}>
          <Text style={styles.modernAppVersionText}>InvyEasy Mobile v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
});

// Count Screen Component
const CountScreen = memo(({ user, onBack }: { user: any; onBack: () => void }) => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [originalCounts, setOriginalCounts] = useState<Record<string, number>>({});
  const [changedItems, setChangedItems] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const itemRefs = useRef<Record<string, any>>({});
  const searchInputRef = useRef<TextInput>(null);

  // Fetch rooms
  const fetchRooms = async () => {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('name');

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      Alert.alert('Error', 'Failed to load rooms');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fetch items for selected room - OPTIMIZED with parallel queries
  const fetchItemsForRoom = useCallback(async (roomId: string) => {
    try {
      setIsLoading(true);

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        return;
      }

      const orgId = profile.organization_id;

      // OPTIMIZATION: Fetch all data in PARALLEL instead of sequentially (3x faster!)
      const [categoriesRes, itemsRes, countsRes] = await Promise.all([
        supabase.from('categories').select('*').eq('organization_id', orgId),
        supabase.from('inventory_items').select('*').eq('organization_id', orgId).order('brand'),
        supabase.from('room_counts').select('*').eq('room_id', roomId).eq('organization_id', orgId)
      ]);

      if (itemsRes.error) throw itemsRes.error;

      // Enrich items with categories
      const enrichedItems = (itemsRes.data || []).map((item, index) => {
        const category = categoriesRes.data?.find(cat => cat.id === item.category_id);
        const roomCount = countsRes.data?.find((c: any) => c.inventory_item_id === item.id);

        // Debug: Log timestamp data for first 3 items
        if (index < 3) {
          console.log(`Item: ${item.brand}, roomCount:`, roomCount, 'updated_at:', roomCount?.updated_at);
        }

        return {
          ...item,
          categories: category ? { name: category.name } : null,
          currentCount: roomCount?.count || 0,
          last_count_at: roomCount?.created_at || null
        };
      });

      setItems(enrichedItems);

      // Initialize counts
      const initialCounts: Record<string, number> = {};
      enrichedItems.forEach(item => {
        initialCounts[item.id] = item.currentCount;
      });
      setCounts(initialCounts);
      setOriginalCounts(initialCounts);
      setChangedItems(new Set());

    } catch (error) {
      console.error('Error fetching items:', error);
      Alert.alert('Error', 'Failed to load inventory items');
    } finally {
      setIsLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchRooms();
  }, [user.id]);

  useEffect(() => {
    if (selectedRoom) {
      fetchItemsForRoom(selectedRoom.id);
    }
  }, [selectedRoom?.id]);

  // Auto-save functionality - OPTIMIZED with batch upsert
  const performSave = async () => {
    if (changedItems.size === 0) return;

    try {
      setIsSaving(true);

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id || !selectedRoom) return;

      const orgId = profile.organization_id;

      // Build array of records to upsert (MUCH FASTER - single query!)
      const recordsToUpsert = Array.from(changedItems).map(itemId => ({
        room_id: selectedRoom.id,
        inventory_item_id: itemId,
        count: counts[itemId] || 0,
        organization_id: orgId
      }));

      // Delete existing counts for these items in this room, then insert new ones
      const itemIds = Array.from(changedItems);

      // First, delete existing counts
      const { error: deleteError } = await supabase
        .from('room_counts')
        .delete()
        .eq('room_id', selectedRoom.id)
        .in('inventory_item_id', itemIds);

      if (deleteError) throw deleteError;

      // Then insert new counts
      const { error: insertError } = await supabase
        .from('room_counts')
        .insert(recordsToUpsert);

      if (insertError) throw insertError;

      // Update original counts and clear changed items
      setOriginalCounts({ ...counts });
      setChangedItems(new Set());

      // Show instant success message (non-blocking)
      Alert.alert('✓ Saved', `${recordsToUpsert.length} count${recordsToUpsert.length > 1 ? 's' : ''} saved`,
        [{ text: 'OK' }],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Error saving counts:', error);
      Alert.alert('Error', 'Failed to save counts');
    } finally {
      setIsSaving(false);
    }
  };

  // Update count with auto-save - OPTIMIZED for instant response
  const updateCount = useCallback((itemId: string, newCount: number) => {
    const finalCount = Math.max(0, newCount);

    // Batch state updates for instant UI response
    setCounts(prev => {
      const updated = { ...prev, [itemId]: finalCount };

      // Track changes inline for better performance
      setChangedItems(prevChanged => {
        const newChangedItems = new Set(prevChanged);
        const originalValue = originalCounts[itemId] || 0;
        if (finalCount !== originalValue) {
          newChangedItems.add(itemId);
        } else {
          newChangedItems.delete(itemId);
        }
        return newChangedItems;
      });

      return updated;
    });

    // Clear existing timeout and set new one
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    const timeout = setTimeout(() => {
      performSave();
    }, 30000); // 30 seconds
    setAutoSaveTimeout(timeout);
  }, [originalCounts, autoSaveTimeout]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    if (selectedRoom) {
      fetchItemsForRoom(selectedRoom.id);
    } else {
      fetchRooms();
    }
  };

  // Filter items based on search (includes barcode) - OPTIMIZED for instant filtering
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;

    const query = searchQuery.trim().toLowerCase();
    const queryUpper = searchQuery.trim();

    // Check for EXACT barcode match - show ONLY that item (isolated)
    const exactBarcodeMatch = items.find(item => item.barcode && item.barcode === queryUpper);
    if (exactBarcodeMatch) {
      // Return ONLY the matched item (isolated view)
      return [exactBarcodeMatch];
    }

    // Otherwise, filter by text (brand, size, category, or partial barcode) - FAST!
    return items.filter(item =>
      item.brand?.toLowerCase().includes(query) ||
      item.size?.toLowerCase().includes(query) ||
      item.categories?.name?.toLowerCase().includes(query) ||
      item.barcode?.includes(queryUpper)
    );
  }, [searchQuery, items]);

  if (isLoading && !selectedRoom) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={styles.loadingText}>Loading rooms...</Text>
      </View>
    );
  }

  // Room selection view
  if (!selectedRoom) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.inventoryHeader}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeft color="#f97316" size={20} strokeWidth={2.5} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.inventoryTitle}>Count Inventory</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Subtitle */}
        <View style={styles.screenSubtitle}>
          <Text style={styles.subtitleText}>Select a room to start counting</Text>
        </View>

        {/* Rooms Grid */}
        <ScrollView
          style={styles.itemsList}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#f97316" />
          }
        >
          {rooms.length === 0 ? (
            <View style={styles.emptyState}>
              <Building2 color="#9ca3af" size={64} strokeWidth={1.5} />
              <Text style={styles.emptyStateTitle}>No rooms available</Text>
              <Text style={styles.emptyStateText}>
                Create rooms on the web app to start counting inventory
              </Text>
            </View>
          ) : (
            <View style={styles.categoriesGrid}>
              {rooms.map((room) => (
                <TouchableOpacity
                  key={room.id}
                  style={styles.roomSelectCard}
                  onPress={() => setSelectedRoom(room)}
                >
                  <View style={[styles.categoryIconContainer, { backgroundColor: '#22c55e' }]}>
                    <Building2 color="#fff" size={28} strokeWidth={2.5} />
                  </View>
                  <Text style={styles.categoryName}>{room.name}</Text>
                  <Text style={styles.categoryDescription}>Tap to count</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  // Counting view
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.inventoryHeader}>
        <TouchableOpacity onPress={() => setSelectedRoom(null)} style={styles.backButton}>
          <ArrowLeft color="#f97316" size={20} strokeWidth={2.5} />
          <Text style={styles.backButtonText}>Rooms</Text>
        </TouchableOpacity>
        <Text style={styles.inventoryTitle}>{selectedRoom.name}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Unified Search Bar (text + barcode) */}
      <TouchableOpacity
        style={styles.searchContainer}
        onPress={() => searchInputRef.current?.focus()}
        activeOpacity={1}
      >
        <Search color="#9ca3af" size={18} strokeWidth={2} />
        <Scan color="#f59e0b" size={16} strokeWidth={2} style={{ marginLeft: 4 }} />
        <TextInput
          ref={searchInputRef}
          style={styles.searchInput}
          placeholder="Search or scan barcode..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          enablesReturnKeyAutomatically
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <XIcon color="#9ca3af" size={18} strokeWidth={2} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* Items Count */}
      <View style={styles.countHeaderRow}>
        <Text style={styles.itemsCountText}>
          {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
        </Text>
        {changedItems.size > 0 && (
          <View style={styles.changesIndicator}>
            <Text style={styles.changesText}>
              {changedItems.size} {changedItems.size === 1 ? 'change' : 'changes'}
            </Text>
          </View>
        )}
      </View>

      {/* Save Button */}
      {changedItems.size > 0 && (
        <View style={styles.saveButtonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={performSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <CheckCircle color="#fff" size={20} strokeWidth={2} />
                <Text style={styles.saveButtonText}>Save {changedItems.size} Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Items List */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        style={styles.itemsList}
        contentContainerStyle={filteredItems.length === 0 ? styles.emptyListContainer : undefined}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#f97316" />
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={[styles.centerContent, { paddingVertical: 80 }]}>
              <ActivityIndicator size="large" color="#f97316" />
              <Text style={styles.loadingText}>Loading items...</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Package color="#9ca3af" size={64} strokeWidth={1.5} />
              <Text style={styles.emptyStateTitle}>No items found</Text>
              <Text style={styles.emptyStateText}>
                {searchQuery ? 'Try adjusting your search' : 'Add items to your inventory on the web app'}
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => {
            const currentCount = counts[item.id] || 0;
            const hasChanged = changedItems.has(item.id);

            return (
              <View
                key={item.id}
                ref={(ref) => { if (ref) itemRefs.current[item.id] = ref; }}
                style={[styles.countItemCard, hasChanged && styles.countItemCardChanged]}
              >
                <View style={styles.countItemHeader}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.brand}</Text>
                    <View style={styles.itemMetaRow}>
                      <Text style={styles.itemSize}>{item.size}</Text>
                      <View style={styles.lastCountBadge}>
                        <Text style={styles.lastCountBadgeText}>
                          {item.last_count_at
                            ? new Date(item.last_count_at).toLocaleDateString('en-US', {
                                month: 'numeric',
                                day: 'numeric',
                                year: 'numeric'
                              })
                            : 'Never counted'}
                        </Text>
                      </View>
                    </View>
                    {item.categories && (
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>{item.categories.name}</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Modern Quick Count Buttons */}
                <View style={styles.modernCountContainer}>
                  {/* Count Display */}
                  <View style={styles.modernCountDisplay}>
                    <Text style={styles.modernCountValue}>{currentCount.toFixed(2)}</Text>
                    {hasChanged && (
                      <Text style={styles.modernCountOriginal}>
                        was {(originalCounts[item.id] || 0).toFixed(2)}
                      </Text>
                    )}
                  </View>

                  {/* Quick Buttons Row */}
                  <View style={styles.modernQuickButtons}>
                    <TouchableOpacity
                      style={[styles.modernQuickBtn, { backgroundColor: '#8B5CF615', borderColor: '#8B5CF630' }]}
                      onPress={() => updateCount(item.id, currentCount + 0.25)}
                    >
                      <Text style={[styles.modernQuickBtnText, { color: '#8B5CF6' }]}>+¼</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modernQuickBtn, { backgroundColor: '#EC489915', borderColor: '#EC489930' }]}
                      onPress={() => updateCount(item.id, currentCount + 0.5)}
                    >
                      <Text style={[styles.modernQuickBtnText, { color: '#EC4899' }]}>+½</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modernQuickBtn, { backgroundColor: '#F9731615', borderColor: '#F9731630' }]}
                      onPress={() => updateCount(item.id, currentCount + 1)}
                    >
                      <Text style={[styles.modernQuickBtnText, { color: '#F97316' }]}>+1</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modernQuickBtn, { backgroundColor: '#10B98115', borderColor: '#10B98130' }]}
                      onPress={() => updateCount(item.id, currentCount + 5)}
                    >
                      <Text style={[styles.modernQuickBtnText, { color: '#10B981' }]}>+5</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modernQuickBtn, { backgroundColor: '#F59E0B15', borderColor: '#F59E0B30' }]}
                      onPress={() => updateCount(item.id, currentCount + 10)}
                    >
                      <Text style={[styles.modernQuickBtnText, { color: '#F59E0B' }]}>+10</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Large +/- Buttons */}
                  <View style={styles.modernMainControls}>
                    <TouchableOpacity
                      style={styles.modernDecrementBtn}
                      onPress={() => updateCount(item.id, Math.max(0, currentCount - 1))}
                    >
                      <LinearGradient
                        colors={['#EF4444', '#DC2626']}
                        style={styles.modernGradientBtn}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Minus color="#FFFFFF" size={24} strokeWidth={3} />
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.modernIncrementBtn}
                      onPress={() => updateCount(item.id, currentCount + 1)}
                    >
                      <LinearGradient
                        colors={['#F97316', '#2563EB']}
                        style={styles.modernGradientBtn}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Plus color="#FFFFFF" size={24} strokeWidth={3} />
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
        }}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={3}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={50}
        getItemLayout={(data, index) => ({
          length: 280,
          offset: 280 * index,
          index,
        })}
      />
    </View>
  );
});

// Add Category Modal Component
const AddCategoryModal = memo(({ user, onClose, onCategoryAdded }: { user: any; onClose: () => void; onCategoryAdded: () => void }) => {
  const [categoryName, setCategoryName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!categoryName.trim()) {
      Alert.alert('Error', 'Category name is required');
      return;
    }

    try {
      setIsSaving(true);

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        Alert.alert('Error', 'No organization found');
        return;
      }

      const { error } = await supabase
        .from('categories')
        .insert([{
          name: categoryName.trim(),
          organization_id: profile.organization_id
        }]);

      if (error) throw error;

      Alert.alert('Success', 'Category added successfully');
      onCategoryAdded();
      onClose();
    } catch (error) {
      console.error('Error adding category:', error);
      Alert.alert('Error', 'Failed to add category');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Add Category</Text>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
            <XIcon color="#6b7280" size={24} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={styles.modalBody}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Category Name</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g., Whiskey, Vodka, Beer"
              placeholderTextColor="#9ca3af"
              value={categoryName}
              onChangeText={setCategoryName}
              autoFocus
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
            <TouchableOpacity
              style={[styles.saveButton, { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.12)' }]}
              onPress={onClose}
            >
              <Text style={[styles.saveButtonText, { color: 'rgba(255, 255, 255, 0.7)' }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, { flex: 1 }, isSaving && { opacity: 0.5 }]}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Adding...' : 'Add Category'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
});

// Edit Category Modal Component
const EditCategoryModal = memo(({ category, user, onClose, onCategoryUpdated }: { category: any; user: any; onClose: () => void; onCategoryUpdated: () => void }) => {
  const [categoryName, setCategoryName] = useState(category.name);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!categoryName.trim()) {
      Alert.alert('Error', 'Category name is required');
      return;
    }

    try {
      setIsSaving(true);

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        Alert.alert('Error', 'No organization found');
        return;
      }

      const { error } = await supabase
        .from('categories')
        .update({ name: categoryName.trim() })
        .eq('id', category.id)
        .eq('organization_id', profile.organization_id);

      if (error) throw error;

      Alert.alert('Success', 'Category updated successfully');
      onCategoryUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating category:', error);
      Alert.alert('Error', 'Failed to update category');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Edit Category</Text>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
            <XIcon color="#6b7280" size={24} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={styles.modalBody}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Category Name</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Enter category name"
              placeholderTextColor="#9ca3af"
              value={categoryName}
              onChangeText={setCategoryName}
              autoFocus
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
            <TouchableOpacity
              style={[styles.saveButton, { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.12)' }]}
              onPress={onClose}
            >
              <Text style={[styles.saveButtonText, { color: 'rgba(255, 255, 255, 0.7)' }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, { flex: 1 }, isSaving && { opacity: 0.5 }]}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Updating...' : 'Update Category'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
});

// Categories Screen Component
const CategoriesScreen = memo(({ user, onBack }: { user: any; onBack: () => void }) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const fetchCategories = async () => {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [user.id]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchCategories();
  };

  const handleDelete = async (categoryId: string, categoryName: string) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${categoryName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { data: profile } = await supabase
                .from('user_profiles')
                .select('organization_id')
                .eq('id', user.id)
                .single();

              const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', categoryId)
                .eq('organization_id', profile?.organization_id);

              if (error) throw error;
              fetchCategories();
            } catch (error) {
              console.error('Error deleting category:', error);
              Alert.alert('Error', 'Failed to delete category');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={styles.loadingText}>Loading categories...</Text>
      </View>
    );
  }

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setShowEditModal(true);
  };

  const handleCategoryAdded = () => {
    fetchCategories();
    setShowAddModal(false);
  };

  const handleCategoryUpdated = () => {
    fetchCategories();
    setShowEditModal(false);
    setEditingCategory(null);
  };

  return (
    <View style={styles.container}>
      {/* Modern Header */}
      <View style={styles.modernScreenHeader}>
        <TouchableOpacity onPress={onBack} style={styles.modernBackButton}>
          <ArrowLeft color="#1A1A1A" size={24} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.modernHeaderCenter}>
          <Text style={styles.modernScreenTitle}>Categories</Text>
          <Text style={styles.modernScreenSubtitle}>
            {categories.length} {categories.length === 1 ? 'category' : 'categories'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.modernAddButton}>
          <Plus color="#fff" size={20} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Categories Grid */}
      <ScrollView
        style={styles.itemsList}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#f97316" />
        }
      >
        {categories.length === 0 ? (
          <View style={styles.emptyState}>
            <ClipboardList color="#9ca3af" size={64} strokeWidth={1.5} />
            <Text style={styles.emptyStateTitle}>No categories yet</Text>
            <Text style={styles.emptyStateText}>
              Tap the + button above to create your first category
            </Text>
          </View>
        ) : (
          <View style={styles.modernCategoriesGrid}>
            {categories.map((category) => (
              <View key={category.id} style={styles.modernCategoryCard}>
                <View style={styles.modernCategoryTop}>
                  <View style={styles.modernCategoryIconWrapper}>
                    <ClipboardList color="#F97316" size={24} strokeWidth={2.5} />
                  </View>
                  <Text style={styles.modernCategoryName} numberOfLines={1}>{category.name}</Text>
                </View>
                <View style={styles.modernCategoryActions}>
                  <TouchableOpacity
                    style={styles.modernEditButton}
                    onPress={() => handleEdit(category)}
                    activeOpacity={0.7}
                  >
                    <Edit color="#F97316" size={16} strokeWidth={2.5} />
                    <Text style={styles.modernEditButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modernDeleteButton}
                    onPress={() => handleDelete(category.id, category.name)}
                    activeOpacity={0.7}
                  >
                    <Trash2 color="#EF4444" size={16} strokeWidth={2.5} />
                    <Text style={styles.modernDeleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      {showAddModal && (
        <AddCategoryModal
          user={user}
          onClose={() => setShowAddModal(false)}
          onCategoryAdded={handleCategoryAdded}
        />
      )}

      {showEditModal && editingCategory && (
        <EditCategoryModal
          category={editingCategory}
          user={user}
          onClose={() => {
            setShowEditModal(false);
            setEditingCategory(null);
          }}
          onCategoryUpdated={handleCategoryUpdated}
        />
      )}
    </View>
  );
});

// Add/Edit Item Modal Component
const AddEditItemModal = memo(({
  item,
  categories,
  suppliers,
  user,
  onClose,
  onSave
}: {
  item?: any;
  categories: any[];
  suppliers: any[];
  user: any;
  onClose: () => void;
  onSave: () => void;
}) => {
  const [brand, setBrand] = useState(item?.brand || '');
  const [size, setSize] = useState(item?.size || '');
  const [categoryId, setCategoryId] = useState(item?.category_id || '');
  const [supplierId, setSupplierId] = useState(item?.supplier_id || '');
  const [price, setPrice] = useState(item?.price_per_item?.toString() || '');
  const [barcode, setBarcode] = useState(item?.barcode || '');
  const [threshold, setThreshold] = useState(item?.threshold?.toString() || '0');
  const [parLevel, setParLevel] = useState(item?.par_level?.toString() || '0');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!brand.trim()) {
      Alert.alert('Error', 'Brand is required');
      return;
    }

    if (!categoryId) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    try {
      setIsSaving(true);

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        Alert.alert('Error', 'Organization not found');
        return;
      }

      const itemData = {
        brand: brand.trim(),
        size: '750ml', // Default size
        category_id: categoryId,
        supplier_id: supplierId || null,
        price_per_item: price ? parseFloat(price) : null,
        barcode: barcode.trim() || null,
        threshold: parseInt(threshold) || 0,
        par_level: parseInt(parLevel) || 0,
        organization_id: profile.organization_id,
      };

      if (item) {
        // Update existing item
        const { error } = await supabase
          .from('inventory_items')
          .update(itemData)
          .eq('id', item.id)
          .eq('organization_id', profile.organization_id);

        if (error) throw error;
        Alert.alert('Success', 'Item updated successfully');
      } else {
        // Create new item
        const { error } = await supabase
          .from('inventory_items')
          .insert(itemData);

        if (error) throw error;
        Alert.alert('Success', 'Item created successfully');
      }

      onSave();
    } catch (error) {
      console.error('Error saving item:', error);
      Alert.alert('Error', 'Failed to save item');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <ScrollView style={styles.modalScroll}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{item ? 'Edit Item' : 'Add Item'}</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <XIcon color="#6b7280" size={24} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.modalBody}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Brand *</Text>
              <TextInput
                style={styles.formInput}
                value={brand}
                onChangeText={setBrand}
                placeholder="e.g., Tito's Vodka"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Category *</Text>
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>
                  {categories.find(c => c.id === categoryId)?.name || 'Select category...'}
                </Text>
                <ScrollView horizontal style={styles.pickerScroll}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.pickerOption,
                        categoryId === cat.id && styles.pickerOptionSelected
                      ]}
                      onPress={() => setCategoryId(cat.id)}
                    >
                      <Text style={[
                        styles.pickerOptionText,
                        categoryId === cat.id && styles.pickerOptionTextSelected
                      ]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Supplier</Text>
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>
                  {suppliers.find(s => s.id === supplierId)?.name || 'Select supplier (optional)...'}
                </Text>
                <ScrollView horizontal style={styles.pickerScroll}>
                  <TouchableOpacity
                    style={[
                      styles.pickerOption,
                      !supplierId && styles.pickerOptionSelected
                    ]}
                    onPress={() => setSupplierId('')}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      !supplierId && styles.pickerOptionTextSelected
                    ]}>
                      None
                    </Text>
                  </TouchableOpacity>
                  {suppliers.map((sup) => (
                    <TouchableOpacity
                      key={sup.id}
                      style={[
                        styles.pickerOption,
                        supplierId === sup.id && styles.pickerOptionSelected
                      ]}
                      onPress={() => setSupplierId(sup.id)}
                    >
                      <Text style={[
                        styles.pickerOptionText,
                        supplierId === sup.id && styles.pickerOptionTextSelected
                      ]}>
                        {sup.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Price per Item</Text>
              <TextInput
                style={styles.formInput}
                value={price}
                onChangeText={setPrice}
                placeholder="0.00"
                placeholderTextColor="#9ca3af"
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Barcode</Text>
              <TextInput
                style={styles.formInput}
                value={barcode}
                onChangeText={setBarcode}
                placeholder="Optional barcode"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, styles.formGroupHalf]}>
                <Text style={styles.formLabel}>Alert Level</Text>
                <TextInput
                  style={styles.formInput}
                  value={threshold}
                  onChangeText={setThreshold}
                  placeholder="0"
                  placeholderTextColor="#9ca3af"
                  keyboardType="number-pad"
                />
              </View>

              <View style={[styles.formGroup, styles.formGroupHalf]}>
                <Text style={styles.formLabel}>Target Level</Text>
                <TextInput
                  style={styles.formInput}
                  value={parLevel}
                  onChangeText={setParLevel}
                  placeholder="0"
                  placeholderTextColor="#9ca3af"
                  keyboardType="number-pad"
                />
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.modalButtonSecondary}
              onPress={onClose}
              disabled={isSaving}
            >
              <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButtonPrimary, isSaving && styles.modalButtonDisabled]}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.modalButtonPrimaryText}>
                  {item ? 'Update' : 'Create'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
});

// Inventory List Component
const InventoryList = memo(({ user, onBack }: { user: any; onBack: () => void }) => {
  const [items, setItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [selectedStockLevel, setSelectedStockLevel] = useState<string | null>(null); // 'low', 'normal', 'high'
  const [sortBy, setSortBy] = useState<string>('name-asc'); // 'name-asc', 'name-desc', 'price-asc', 'price-desc', 'quantity-asc', 'quantity-desc'
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const inventorySearchRef = useRef<TextInput>(null);
  const [showSortModal, setShowSortModal] = useState(false);
  const [showBulkCategoryModal, setShowBulkCategoryModal] = useState(false);

  const fetchInventoryItems = async () => {
    try {
      // Get user's organization
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        setIsLoading(false);
        return;
      }

      const orgId = profile.organization_id;

      // Fetch categories, suppliers, items, and counts in parallel
      const [categoriesRes, suppliersRes, itemsRes, countsRes] = await Promise.all([
        supabase.from('categories').select('*').eq('organization_id', orgId).order('name'),
        supabase.from('suppliers').select('*').eq('organization_id', orgId).order('name'),
        supabase.from('inventory_items').select('*').eq('organization_id', orgId).order('brand'),
        supabase.from('room_counts').select('inventory_item_id, count, created_at').eq('organization_id', orgId)
      ]);

      if (itemsRes.error) throw itemsRes.error;

      // Store categories and suppliers for the modal
      setCategories(categoriesRes.data || []);
      setSuppliers(suppliersRes.data || []);

      // Manually enrich items with category and supplier names
      const enrichedItems = (itemsRes.data || []).map(item => {
        const category = categoriesRes.data?.find(cat => cat.id === item.category_id);
        const supplier = suppliersRes.data?.find(sup => sup.id === item.supplier_id);
        const itemCounts = (countsRes.data || []).filter((c: any) => c.inventory_item_id === item.id);
        const totalCount = itemCounts.reduce((sum: number, c: any) => sum + c.count, 0);

        // Find the most recent count creation timestamp
        const lastCountAt = itemCounts.length > 0
          ? itemCounts.reduce((latest: string | null, c: any) => {
              if (!latest) return c.created_at;
              return new Date(c.created_at) > new Date(latest) ? c.created_at : latest;
            }, null)
          : null;

        return {
          ...item,
          categories: category ? { name: category.name } : null,
          suppliers: supplier ? { name: supplier.name } : null,
          totalCount,
          last_count_at: lastCountAt
        };
      });

      setItems(enrichedItems);

    } catch (error) {
      console.error('Error fetching inventory:', error);
      Alert.alert('Error', 'Failed to load inventory items');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInventoryItems();
  }, [user.id]);

  // Optimize filtering with useMemo - recalculates only when dependencies change
  const filteredItems = useMemo(() => {
    let filtered = items;

    // Apply category filter
    if (selectedCategoryId) {
      filtered = filtered.filter(item => item.category_id === selectedCategoryId);
    }

    // Apply supplier filter
    if (selectedSupplierId) {
      filtered = filtered.filter(item => item.supplier_id === selectedSupplierId);
    }

    // Apply stock level filter
    if (selectedStockLevel) {
      filtered = filtered.filter(item => {
        const count = item.totalCount || 0;
        if (selectedStockLevel === 'low') return count < 10;
        if (selectedStockLevel === 'normal') return count >= 10 && count <= 50;
        if (selectedStockLevel === 'high') return count > 50;
        return true;
      });
    }

    // Apply search filter (includes barcode)
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      const queryUpper = searchQuery.trim();

      // Otherwise, filter by text (brand, size, category, or partial barcode)
      filtered = filtered.filter(item =>
        item.brand?.toLowerCase().includes(query) ||
        item.size?.toLowerCase().includes(query) ||
        item.categories?.name?.toLowerCase().includes(query) ||
        item.barcode?.includes(queryUpper)
      );
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return (a.brand || '').localeCompare(b.brand || '');
        case 'name-desc':
          return (b.brand || '').localeCompare(a.brand || '');
        case 'price-asc':
          return (a.price_per_item || 0) - (b.price_per_item || 0);
        case 'price-desc':
          return (b.price_per_item || 0) - (a.price_per_item || 0);
        case 'quantity-asc':
          return (a.totalCount || 0) - (b.totalCount || 0);
        case 'quantity-desc':
          return (b.totalCount || 0) - (a.totalCount || 0);
        default:
          return 0;
      }
    });
  }, [searchQuery, selectedCategoryId, selectedSupplierId, selectedStockLevel, sortBy, items]);

  // Check for exact barcode match and auto-open
  useEffect(() => {
    const query = searchQuery.trim();
    if (query !== '') {
      const exactBarcodeMatch = items.find(item => item.barcode && item.barcode === query);
      if (exactBarcodeMatch) {
        handleEditItem(exactBarcodeMatch);
        setSearchQuery('');
      }
    }
  }, [searchQuery, items]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchInventoryItems();
  };

  const handleSaveItem = () => {
    setShowAddModal(false);
    setEditingItem(null);
    fetchInventoryItems();
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={styles.loadingText}>Loading inventory...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Modern Branded Header */}
      <View style={styles.modernBrandedHeader}>
        <TouchableOpacity onPress={onBack} style={styles.modernBackButton}>
          <ArrowLeft color="#1A1A1A" size={24} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.modernBrandedHeaderCenter}>
          <View style={styles.modernHeaderLogoWrapper}>
            <Package color="#fff" size={16} strokeWidth={2.5} />
          </View>
          <View>
            <Text style={styles.modernBrandName}>InvyEasy</Text>
            <Text style={styles.modernScreenSubtitle}>Inventory Management</Text>
          </View>
        </View>
        <View style={styles.modernHeaderActions}>
          <TouchableOpacity
            onPress={() => setIsSelectMode(!isSelectMode)}
            style={[styles.modernSelectButton, isSelectMode && styles.modernSelectButtonActive]}
            activeOpacity={0.7}
          >
            <Text style={[styles.modernSelectButtonText, isSelectMode && styles.modernSelectButtonTextActive]}>
              {isSelectMode ? 'Cancel' : 'Select'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.modernAddButton} activeOpacity={0.7}>
            <Plus color="#fff" size={20} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Modern Search Bar */}
      <View style={styles.modernSearchContainer}>
        <TouchableOpacity
          style={styles.modernSearchBar}
          onPress={() => inventorySearchRef.current?.focus()}
          activeOpacity={1}
        >
          <Search color="#9CA3AF" size={18} strokeWidth={2.5} />
          <TextInput
            ref={inventorySearchRef}
            style={styles.modernSearchInput}
            placeholder="Search inventory..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            enablesReturnKeyAutomatically
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
              <XIcon color="#9CA3AF" size={18} strokeWidth={2.5} />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </View>

      {/* Modern Filters Section */}
      <View style={styles.modernFiltersSection}>
        {/* Category Pills */}
        <View style={styles.modernFilterRow}>
          <Text style={styles.modernFilterLabel}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modernFilterScroll}>
            <TouchableOpacity
              style={[styles.modernFilterPill, !selectedCategoryId && styles.modernFilterPillActive]}
              onPress={() => setSelectedCategoryId(null)}
              activeOpacity={0.7}
            >
              <Text style={[styles.modernFilterPillText, !selectedCategoryId && styles.modernFilterPillTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.modernFilterPill, selectedCategoryId === category.id && styles.modernFilterPillActive]}
                onPress={() => setSelectedCategoryId(category.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.modernFilterPillText, selectedCategoryId === category.id && styles.modernFilterPillTextActive]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Stock Level Pills & Sort */}
        <View style={styles.modernFilterRowSpaced}>
          <View style={styles.modernStockFilters}>
            <Text style={styles.modernFilterLabel}>Stock</Text>
            <View style={styles.modernStockPills}>
              <TouchableOpacity
                style={[styles.modernFilterPillSmall, !selectedStockLevel && styles.modernFilterPillActive]}
                onPress={() => setSelectedStockLevel(null)}
                activeOpacity={0.7}
              >
                <Text style={[styles.modernFilterPillTextSmall, !selectedStockLevel && styles.modernFilterPillTextActive]}>
                  All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modernFilterPillSmall, selectedStockLevel === 'low' && styles.modernFilterPillActive]}
                onPress={() => setSelectedStockLevel('low')}
                activeOpacity={0.7}
              >
                <Text style={[styles.modernFilterPillTextSmall, selectedStockLevel === 'low' && styles.modernFilterPillTextActive]}>
                  Low
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modernFilterPillSmall, selectedStockLevel === 'high' && styles.modernFilterPillActive]}
                onPress={() => setSelectedStockLevel('high')}
                activeOpacity={0.7}
              >
                <Text style={[styles.modernFilterPillTextSmall, selectedStockLevel === 'high' && styles.modernFilterPillTextActive]}>
                  High
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.modernSortButton}
            onPress={() => setShowSortModal(true)}
            activeOpacity={0.7}
          >
            <ArrowUpDown color="#F97316" size={16} strokeWidth={2.5} />
            <Text style={styles.modernSortButtonText}>Sort</Text>
          </TouchableOpacity>
        </View>

        {/* Items Count */}
        <View style={styles.modernItemsCount}>
          <Text style={styles.modernItemsCountText}>
            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
          </Text>
        </View>
      </View>

      {/* Items List */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        style={styles.itemsList}
        contentContainerStyle={filteredItems.length === 0 ? styles.emptyListContainer : undefined}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#f97316" />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📦</Text>
            <Text style={styles.emptyStateTitle}>No items found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'Try adjusting your search' : 'Start by adding items to your inventory'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
            <View style={styles.modernInventoryItemWrapper}>
              {isSelectMode && (
                <View style={styles.modernCheckboxContainer}>
                  <TouchableOpacity
                    style={[styles.modernCheckbox, selectedItems.has(item.id) && styles.modernCheckboxChecked]}
                    onPress={() => {
                      const newSelected = new Set(selectedItems);
                      if (newSelected.has(item.id)) {
                        newSelected.delete(item.id);
                      } else {
                        newSelected.add(item.id);
                      }
                      setSelectedItems(newSelected);
                    }}
                  >
                    {selectedItems.has(item.id) && <Check color="#fff" size={16} strokeWidth={3} />}
                  </TouchableOpacity>
                </View>
              )}
              <TouchableOpacity
                style={styles.inventoryItemCard}
                onPress={() => {
                  if (!isSelectMode) {
                    handleEditItem(item);
                  }
                }}
                activeOpacity={0.7}
              >
                <View style={styles.inventoryItemHeader}>
                  <View style={styles.inventoryItemHeaderLeft}>
                    <Text style={styles.inventoryItemBrand}>{item.brand}</Text>
                    <Text style={styles.inventoryItemCategory}>{item.categories?.name || 'Uncategorized'}</Text>
                    {item.last_count_at && (
                      <Text style={styles.inventoryItemLastCounted}>
                        Last counted: {(() => {
                          const now = new Date();
                          const lastCount = new Date(item.last_count_at);
                          const diffMs = now.getTime() - lastCount.getTime();
                          const diffMins = Math.floor(diffMs / 60000);
                          const diffHours = Math.floor(diffMs / 3600000);
                          const diffDays = Math.floor(diffMs / 86400000);

                          if (diffMins < 1) return 'just now';
                          if (diffMins < 60) return `${diffMins}m ago`;
                          if (diffHours < 24) return `${diffHours}h ago`;
                          if (diffDays === 1) return 'yesterday';
                          if (diffDays < 7) return `${diffDays}d ago`;
                          return lastCount.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        })()}
                      </Text>
                    )}
                  </View>
                  <View style={styles.inventoryItemHeaderRight}>
                    {item.totalCount === 0 ? (
                      <View style={[styles.inventoryStatusBadge, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                        <AlertTriangle color="#DC2626" size={14} strokeWidth={2.5} />
                        <Text style={[styles.inventoryStatusText, { color: '#DC2626' }]}>Out</Text>
                      </View>
                    ) : item.totalCount <= (item.threshold || 5) ? (
                      <View style={[styles.inventoryStatusBadge, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                        <AlertTriangle color="#D97706" size={14} strokeWidth={2.5} />
                        <Text style={[styles.inventoryStatusText, { color: '#D97706' }]}>Low</Text>
                      </View>
                    ) : (
                      <View style={[styles.inventoryStatusBadge, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                        <Check color="#059669" size={14} strokeWidth={2.5} />
                        <Text style={[styles.inventoryStatusText, { color: '#059669' }]}>Good</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.inventoryItemDetails}>
                  {item.size ? (
                    <View style={styles.inventoryItemDetailRow}>
                      <Text style={styles.inventoryItemDetailLabel}>Size:</Text>
                      <Text style={styles.inventoryItemDetailValue}>{String(item.size)}</Text>
                    </View>
                  ) : null}
                  {item.barcode ? (
                    <View style={styles.inventoryItemDetailRow}>
                      <Text style={styles.inventoryItemDetailLabel}>Barcode:</Text>
                      <Text style={styles.inventoryItemDetailValue}>{String(item.barcode)}</Text>
                    </View>
                  ) : null}
                  <View style={styles.inventoryItemDetailRow}>
                    <Text style={styles.inventoryItemDetailLabel}>Stock:</Text>
                    <Text style={styles.inventoryItemDetailValueBold}>{String(item.totalCount || 0)}</Text>
                  </View>
                  {item.threshold ? (
                    <View style={styles.inventoryItemDetailRow}>
                      <Text style={styles.inventoryItemDetailLabel}>Low Stock Alert:</Text>
                      <Text style={styles.inventoryItemDetailValue}>{String(item.threshold)}</Text>
                    </View>
                  ) : null}
                  {item.last_count_at ? (
                    <View style={styles.inventoryItemDetailRow}>
                      <Text style={styles.inventoryItemDetailLabel}>Last Count:</Text>
                      <Text style={styles.inventoryItemDetailValue}>
                        {new Date(item.last_count_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.inventoryItemActions}>
                  <TouchableOpacity
                    style={styles.inventoryEditButton}
                    onPress={() => handleEditItem(item)}
                  >
                    <Edit color="#F97316" size={16} strokeWidth={2.5} />
                    <Text style={styles.inventoryEditButtonText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </View>
        )}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={50}
      />

      {/* Bulk Actions Bar */}
      {isSelectMode && selectedItems.size > 0 && (
        <View style={styles.bulkActionsBar}>
          <Text style={styles.bulkActionsText}>
            {selectedItems.size} item{selectedItems.size > 1 ? 's' : ''} selected
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              style={styles.bulkActionButton}
              onPress={() => setShowBulkCategoryModal(true)}
            >
              <Edit color="#f97316" size={18} strokeWidth={2} />
              <Text style={styles.bulkActionButtonText}>Category</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bulkActionButton, styles.bulkActionButtonDanger]}
              onPress={async () => {
                if (selectedItems.size === 0) return;

                const confirmed = await new Promise((resolve) => {
                  Alert.alert(
                    'Delete Items',
                    `Are you sure you want to delete ${selectedItems.size} item${selectedItems.size > 1 ? 's' : ''}?`,
                    [
                      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
                      { text: 'Delete', style: 'destructive', onPress: () => resolve(true) }
                    ]
                  );
                });

                if (!confirmed) return;

                try {
                  const { error } = await supabase
                    .from('inventory_items')
                    .delete()
                    .in('id', Array.from(selectedItems));

                  if (error) throw error;

                  Alert.alert('Success', `Deleted ${selectedItems.size} item${selectedItems.size > 1 ? 's' : ''}`);
                  setSelectedItems(new Set());
                  setIsSelectMode(false);
                  fetchInventoryItems();
                } catch (error) {
                  console.error('Error deleting items:', error);
                  Alert.alert('Error', 'Failed to delete items');
                }
              }}
            >
              <Trash2 color="#dc2626" size={18} strokeWidth={2} />
              <Text style={[styles.bulkActionButtonText, { color: '#dc2626' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Sort Modal */}
      <Modal visible={showSortModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={styles.sortModal}>
            <Text style={styles.sortModalTitle}>Sort By</Text>
            {[
              { label: 'Name (A-Z)', value: 'name-asc' },
              { label: 'Name (Z-A)', value: 'name-desc' },
              { label: 'Price (Low-High)', value: 'price-asc' },
              { label: 'Price (High-Low)', value: 'price-desc' },
              { label: 'Quantity (Low-High)', value: 'quantity-asc' },
              { label: 'Quantity (High-Low)', value: 'quantity-desc' },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.sortOption, sortBy === option.value && styles.sortOptionActive]}
                onPress={() => {
                  setSortBy(option.value);
                  setShowSortModal(false);
                }}
              >
                <Text style={[styles.sortOptionText, sortBy === option.value && styles.sortOptionTextActive]}>
                  {option.label}
                </Text>
                {sortBy === option.value && <CheckCircle color="#f97316" size={18} strokeWidth={2.5} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Bulk Category Modal */}
      <Modal visible={showBulkCategoryModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowBulkCategoryModal(false)}
        >
          <View style={styles.sortModal}>
            <Text style={styles.sortModalTitle}>Change Category</Text>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.sortOption}
                onPress={async () => {
                  if (selectedItems.size === 0) return;

                  try {
                    const { error } = await supabase
                      .from('inventory_items')
                      .update({ category_id: category.id })
                      .in('id', Array.from(selectedItems));

                    if (error) throw error;

                    Alert.alert('Success', `Updated ${selectedItems.size} item${selectedItems.size > 1 ? 's' : ''} to category "${category.name}"`);
                    setSelectedItems(new Set());
                    setIsSelectMode(false);
                    setShowBulkCategoryModal(false);
                    fetchInventoryItems();
                  } catch (error) {
                    console.error('Error updating category:', error);
                    Alert.alert('Error', 'Failed to update category');
                  }
                }}
              >
                <Text style={styles.sortOptionText}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add/Edit Item Modal */}
      {(showAddModal || editingItem) && (
        <AddEditItemModal
          item={editingItem}
          categories={categories}
          suppliers={suppliers}
          user={user}
          onClose={() => {
            setShowAddModal(false);
            setEditingItem(null);
          }}
          onSave={handleSaveItem}
        />
      )}
    </View>
  );
});

// Dashboard Component
function Dashboard({ user, userProfile, onLogout }: { user: any; userProfile?: any; onLogout: () => void }) {
  const [stats, setStats] = useState({
    totalItems: 0,
    totalCategories: 0,
    totalRooms: 0,
    totalValue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [previousTab, setPreviousTab] = useState('home');
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingChangesCount, setPendingChangesCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      // If offline, try to load from cache
      if (!isOnline) {
        console.log('📱 Offline mode: Loading dashboard data from cache...');
        const cachedStats = await OfflineDataService.getCachedData(OfflineDataService.CACHE_KEYS.ITEMS);
        if (cachedStats) {
          setStats(cachedStats);
          console.log('✅ Loaded dashboard data from cache');
        } else {
          console.log('⚠️ No cached dashboard data available');
        }
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      // Get user's organization
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        setIsLoading(false);
        return;
      }

      const orgId = profile.organization_id;

      // Fetch all data in parallel
      const [itemsRes, categoriesRes, roomsRes, countsRes] = await Promise.all([
        supabase.from('inventory_items').select('*').eq('organization_id', orgId),
        supabase.from('categories').select('*').eq('organization_id', orgId),
        supabase.from('rooms').select('*').eq('organization_id', orgId),
        supabase.from('room_counts').select('*'),
      ]);

      // Calculate total value
      let totalValue = 0;
      if (itemsRes.data && countsRes.data) {
        totalValue = itemsRes.data.reduce((total, item) => {
          const itemCounts = countsRes.data.filter((c: any) => c.inventory_item_id === item.id);
          const totalCount = itemCounts.reduce((sum: number, c: any) => sum + c.count, 0);
          return total + (totalCount * (item.price_per_item || 0));
        }, 0);
      }

      const newStats = {
        totalItems: itemsRes.data?.length || 0,
        totalCategories: categoriesRes.data?.length || 0,
        totalRooms: roomsRes.data?.length || 0,
        totalValue,
      };

      setStats(newStats);

      // Cache the data for offline use
      await OfflineDataService.cacheData(OfflineDataService.CACHE_KEYS.ITEMS, newStats);
      await OfflineDataService.updateLastSync();
      console.log('💾 Dashboard data cached successfully');

    } catch (error) {
      console.error('Error fetching dashboard data:', error);

      // Try to load from cache on error
      const cachedStats = await OfflineDataService.getCachedData(OfflineDataService.CACHE_KEYS.ITEMS);
      if (cachedStats) {
        setStats(cachedStats);
        Alert.alert('Offline Mode', 'Using cached data. Some information may be outdated.');
      } else {
        Alert.alert('Error', 'Failed to load dashboard data');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Check pending changes count on mount and update periodically
  useEffect(() => {
    const checkPendingChanges = async () => {
      const pending = await OfflineDataService.getPendingChanges();
      setPendingChangesCount(pending.length);

      const lastSync = await OfflineDataService.getLastSync();
      setLastSyncTime(lastSync);
    };

    checkPendingChanges();
    const interval = setInterval(checkPendingChanges, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Auto-sync function
  const performAutoSync = async () => {
    if (isSyncing) return; // Prevent multiple syncs at once

    setIsSyncing(true);
    console.log('🔄 Starting auto-sync...');

    try {
      // Sync pending changes
      const syncResult = await OfflineDataService.syncPendingChanges();

      if (syncResult.success > 0) {
        console.log(`✅ Successfully synced ${syncResult.success} changes`);

        // Update pending count
        const pending = await OfflineDataService.getPendingChanges();
        setPendingChangesCount(pending.length);

        // Update last sync time
        const lastSync = await OfflineDataService.getLastSync();
        setLastSyncTime(lastSync);

        // Refresh dashboard data
        await fetchDashboardData();
      }

      if (syncResult.failed > 0) {
        console.warn(`⚠️ Failed to sync ${syncResult.failed} changes`);
        Alert.alert(
          'Sync Warning',
          `${syncResult.failed} changes could not be synced. They will be retried later.`
        );
      }
    } catch (error) {
      console.error('❌ Auto-sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Network status listener
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const wasOffline = !isOnline;
      const isNowOnline = state.isConnected ?? false;

      setIsOnline(isNowOnline);

      // Show banner when going offline
      if (!isNowOnline && wasOffline !== true) {
        setShowOfflineBanner(true);
        console.log('📴 Network connection lost - entering offline mode');
      }

      // Auto-sync when coming back online
      if (isNowOnline && wasOffline === true) {
        setShowOfflineBanner(false);
        console.log('📶 Network connection restored - performing auto-sync...');
        performAutoSync();
      }
    });

    return () => unsubscribe();
  }, [isOnline, isSyncing]);

  useEffect(() => {
    fetchDashboardData();
  }, [user.id]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData();
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={styles.loadingText}>Loading your inventory...</Text>
      </View>
    );
  }

  // Render different screens based on active tab
  const renderScreen = () => {
    switch (activeTab) {
      case 'inventory':
        return <InventoryList user={user} onBack={() => setActiveTab('home')} />;
      case 'categories':
        return <CategoriesScreen user={user} onBack={() => setActiveTab('home')} />;
      case 'count':
        return <CountScreen user={user} onBack={() => setActiveTab('home')} />;
      case 'stock':
        return <StockMovementScreen user={user} onBack={() => setActiveTab('home')} />;
      case 'rooms':
        return <RoomsScreen user={user} onBack={() => setActiveTab(previousTab)} />;
      case 'suppliers':
        return <SuppliersScreen user={user} onBack={() => setActiveTab(previousTab)} />;
      case 'orders':
        return <OrdersScreen user={user} onBack={() => setActiveTab(previousTab)} />;
      case 'reports':
        return <ReportsScreen user={user} onBack={() => setActiveTab(previousTab)} />;
      case 'team':
        return <TeamPINScreen user={user} userProfile={userProfile} onBack={() => setActiveTab(previousTab)} />;
      case 'analytics':
        return <StockAnalyticsScreen user={user} userProfile={userProfile} onBack={() => setActiveTab(previousTab)} />;
      case 'more':
        return <MoreScreen
          user={user}
          userProfile={userProfile}
          onLogout={onLogout}
          onBack={() => setActiveTab('home')}
          onNavigateToRooms={() => {
            setPreviousTab('more');
            setActiveTab('rooms');
          }}
          onNavigateToSuppliers={() => {
            setPreviousTab('more');
            setActiveTab('suppliers');
          }}
          onNavigateToOrders={() => {
            setPreviousTab('more');
            setActiveTab('orders');
          }}
          onNavigateToReports={() => {
            setPreviousTab('more');
            setActiveTab('reports');
          }}
          onNavigateToTeam={() => {
            setPreviousTab('more');
            setActiveTab('team');
          }}
          onNavigateToAnalytics={() => {
            setPreviousTab('more');
            setActiveTab('analytics');
          }}
        />;
      case 'home':
      default:
        return renderHomeScreen();
    }
  };

  const renderHomeScreen = () => (
    <View style={styles.dashboardContainer}>
      <ScrollView
        style={styles.dashboardScroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#f97316" />
        }
      >
        {/* Modern Header */}
        <View style={styles.modernDashboardHeader}>
          <View style={styles.modernLogoWrapper}>
            <View style={styles.modernDashboardLogo}>
              <Package color="#F97316" size={18} strokeWidth={2.5} />
            </View>
            <Text style={styles.modernBrandName}>InvyEasy</Text>
          </View>
        </View>

        {/* Sync Status Banner */}
        {(!isOnline || isSyncing || pendingChangesCount > 0) && (
          <View style={[
            styles.syncBanner,
            !isOnline ? styles.syncBannerOffline :
            isSyncing ? styles.syncBannerSyncing :
            styles.syncBannerWarning
          ]}>
            <View style={styles.syncBannerContent}>
              {!isOnline ? (
                <>
                  <WifiOff color="#dc2626" size={18} strokeWidth={2.5} />
                  <View style={styles.syncBannerTextContainer}>
                    <Text style={styles.syncBannerText}>
                      You're offline. Using cached data.
                    </Text>
                    {pendingChangesCount > 0 && (
                      <Text style={styles.syncBannerSubtext}>
                        {pendingChangesCount} change{pendingChangesCount !== 1 ? 's' : ''} pending sync
                      </Text>
                    )}
                  </View>
                </>
              ) : isSyncing ? (
                <>
                  <ActivityIndicator size="small" color="#2563eb" />
                  <Text style={styles.syncBannerText}>
                    Syncing changes...
                  </Text>
                </>
              ) : pendingChangesCount > 0 ? (
                <>
                  <Wifi color="#f59e0b" size={18} strokeWidth={2.5} />
                  <View style={styles.syncBannerTextContainer}>
                    <Text style={styles.syncBannerText}>
                      {pendingChangesCount} change{pendingChangesCount !== 1 ? 's' : ''} waiting to sync
                    </Text>
                    <TouchableOpacity onPress={performAutoSync}>
                      <Text style={styles.syncNowButton}>Sync Now</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : null}
            </View>
            {lastSyncTime && isOnline && (
              <Text style={styles.lastSyncText}>
                Last synced: {new Date(lastSyncTime).toLocaleTimeString()}
              </Text>
            )}
          </View>
        )}

        {/* Welcome Banner */}
        {showWelcome && (
          <View style={styles.welcomeBanner}>
            <View style={styles.welcomeContent}>
              <View style={styles.welcomeIconContainer}>
                <Text style={styles.welcomeEmoji}>👋</Text>
              </View>
              <View style={styles.welcomeTextContainer}>
                <Text style={styles.welcomeTitle}>Welcome back{userProfile?.full_name ? `, ${userProfile.full_name}!` : '!'}</Text>
                <Text style={styles.welcomeSubtext}>You're signed in as {userProfile?.full_name || user.email}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setShowWelcome(false)} style={styles.dismissButton}>
              <XIcon color="#9ca3af" size={16} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        )}

        {/* Modern Stats Cards */}
        <View style={styles.modernStatsContainer}>
          <StatCard
            icon={Package}
            label="Total Items"
            value={stats.totalItems}
            color="#f97316"
          />
          <StatCard
            icon={ClipboardList}
            label="Categories"
            value={stats.totalCategories}
            color="#3b82f6"
          />
          <StatCard
            icon={Building2}
            label="Rooms"
            value={stats.totalRooms}
            color="#10b981"
          />
          <StatCard
            icon={DollarSign}
            label="Total Value"
            value={`$${stats.totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
            color="#8b5cf6"
          />
        </View>

        {/* Modern Sync Success Message */}
        <View style={styles.modernSyncBanner}>
          <CheckCircle color="#10b981" size={18} strokeWidth={2.5} />
          <View style={styles.modernSyncTextContainer}>
            <Text style={styles.modernSyncTitle}>Synced with Web App</Text>
            <Text style={styles.modernSyncSubtext}>Pull to refresh</Text>
          </View>
        </View>

        {/* Modern Quick Actions */}
        <View style={styles.modernQuickActionsContainer}>
          <Text style={styles.modernQuickActionsTitle}>Quick Actions</Text>
          <View style={styles.modernQuickActionsGrid}>
            <TouchableOpacity
              style={styles.modernQuickActionCard}
              onPress={() => setActiveTab('inventory')}
              activeOpacity={0.7}
            >
              <View style={[styles.modernQuickActionIcon, { backgroundColor: '#f9731615' }]}>
                <Package color="#f97316" size={22} strokeWidth={2.5} />
              </View>
              <Text style={styles.modernQuickActionLabel}>Inventory</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modernQuickActionCard}
              onPress={() => setActiveTab('categories')}
              activeOpacity={0.7}
            >
              <View style={[styles.modernQuickActionIcon, { backgroundColor: '#3b82f615' }]}>
                <ClipboardList color="#3b82f6" size={22} strokeWidth={2.5} />
              </View>
              <Text style={styles.modernQuickActionLabel}>Categories</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modernQuickActionCard}
              onPress={() => {
                setPreviousTab('home');
                setActiveTab('rooms');
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.modernQuickActionIcon, { backgroundColor: '#10b98115' }]}>
                <Building2 color="#10b981" size={22} strokeWidth={2.5} />
              </View>
              <Text style={styles.modernQuickActionLabel}>Rooms</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modernQuickActionCard}
              onPress={() => setActiveTab('count')}
              activeOpacity={0.7}
            >
              <View style={[styles.modernQuickActionIcon, { backgroundColor: '#8b5cf615' }]}>
                <BarChart3 color="#8b5cf6" size={22} strokeWidth={2.5} />
              </View>
              <Text style={styles.modernQuickActionLabel}>Count</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Tab Navigation */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('home')}
        >
          <Home
            color={activeTab === 'home' ? '#f97316' : '#9ca3af'}
            size={24}
            strokeWidth={2}
          />
          <Text style={[styles.tabLabel, activeTab === 'home' && styles.tabLabelActive]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('inventory')}
        >
          <Package
            color={activeTab === 'inventory' ? '#f97316' : '#9ca3af'}
            size={24}
            strokeWidth={2}
          />
          <Text style={[styles.tabLabel, activeTab === 'inventory' && styles.tabLabelActive]}>Inventory</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('count')}
        >
          <BarChart3
            color={activeTab === 'count' ? '#f97316' : '#9ca3af'}
            size={24}
            strokeWidth={2}
          />
          <Text style={[styles.tabLabel, activeTab === 'count' && styles.tabLabelActive]}>Count</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('stock')}
        >
          <ArrowUpDown
            color={activeTab === 'stock' ? '#f97316' : '#9ca3af'}
            size={24}
            strokeWidth={2}
          />
          <Text style={[styles.tabLabel, activeTab === 'stock' && styles.tabLabelActive]}>Stock</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('more')}
        >
          <Settings
            color={activeTab === 'more' ? '#f97316' : '#9ca3af'}
            size={24}
            strokeWidth={2}
          />
          <Text style={[styles.tabLabel, activeTab === 'more' && styles.tabLabelActive]}>More</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderScreen()}
    </View>
  );
}

// Onboarding Component
const Onboarding = memo(({ onGetStarted, onLogin }: { onGetStarted: () => void; onLogin: () => void }) => {
  const [currentPage, setCurrentPage] = useState(0);

  const pages = [
    {
      title: "Track Your Inventory",
      subtitle: "Manage all your liquor inventory in one place",
      icon: "📦",
      color: "#f97316"
    },
    {
      title: "Count with Ease",
      subtitle: "Quick and accurate inventory counts by room",
      icon: "✅",
      color: "#10b981"
    },
    {
      title: "Insights & Reports",
      subtitle: "Powerful analytics to optimize your stock",
      icon: "📊",
      color: "#3b82f6"
    }
  ];

  return (
    <View style={styles.onboardingContainer}>
      {/* Swipeable Pages */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const pageIndex = Math.round(e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width);
          setCurrentPage(pageIndex);
        }}
        style={styles.onboardingScroll}
      >
        {pages.map((page, index) => (
          <View key={index} style={styles.onboardingPage}>
            <View style={styles.onboardingContent}>
              <Text style={[styles.onboardingIcon, { color: page.color }]}>{page.icon}</Text>
              <Text style={styles.onboardingTitle}>{page.title}</Text>
              <Text style={styles.onboardingSubtitle}>{page.subtitle}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Page Indicators */}
      <View style={styles.pageIndicators}>
        {pages.map((_, index) => (
          <View
            key={index}
            style={[
              styles.pageIndicator,
              currentPage === index && styles.pageIndicatorActive
            ]}
          />
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.onboardingActions}>
        <TouchableOpacity
          style={styles.onboardingGetStartedButton}
          onPress={onGetStarted}
        >
          <Text style={styles.onboardingGetStartedButtonText}>Get Started Free</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.onboardingLoginButton}
          onPress={onLogin}
        >
          <Text style={styles.onboardingLoginButtonText}>Already have an account? Log in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showSignUp, setShowSignUp] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) throw error;

      // Fetch user profile from user_profiles table
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, email, full_name, role, organization_id')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.warn('Could not fetch user profile:', profileError);
      }

      // Success!
      setIsLoggedIn(true);
      setUserData(data.user);
      setUserProfile(profile);
      // No alert - smooth transition to dashboard

    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    // Validate required fields
    if (!email || !password || !firstName || !lastName || !organizationName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      // Call the API endpoint to create organization + user profile + auth user
      const response = await fetch(`${apiUrl}/api/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          password: password,
          company: organizationName.trim(),
          phone: '',
          businessType: 'personal',
          employees: '1-10',
          primaryApp: 'inventory-management'
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create account');
      }

      Alert.alert(
        'Success!',
        'Your account has been created successfully! You can now log in.',
        [{ text: 'OK', onPress: () => setShowSignUp(false) }]
      );

      // Clear form fields
      setFirstName('');
      setLastName('');
      setOrganizationName('');
      setEmail('');
      setPassword('');

    } catch (error: any) {
      Alert.alert('Sign Up Failed', error.message || 'Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUserData(null);
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setOrganizationName('');
    setShowOnboarding(true);
  };

  // Show dashboard if logged in
  if (isLoggedIn && userData) {
    return <Dashboard user={userData} userProfile={userProfile} onLogout={handleLogout} />;
  }

  // Show onboarding first
  if (showOnboarding) {
    return (
      <ModernOnboarding
        onGetStarted={() => {
          setShowOnboarding(false);
          setShowSignUp(true);
        }}
        onLogin={() => {
          setShowOnboarding(false);
          setShowSignUp(false);
        }}
      />
    );
  }

  // Show sign up or login screen
  const isSignUpMode = showSignUp;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.loginContent}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setShowOnboarding(true)}
          activeOpacity={0.7}
        >
          <ArrowLeft color="#FFFFFF" size={22} strokeWidth={2.5} />
        </TouchableOpacity>

        {/* Logo Section */}
        <View style={styles.header}>
          <View style={styles.logoWrapper}>
            <View style={styles.logo}>
              <Package color="#F97316" size={32} strokeWidth={2.5} />
            </View>
            <Text style={styles.brandName}>InvyEasy</Text>
          </View>
          <Text style={styles.title}>
            {isSignUpMode ? 'Create Your Account' : 'Welcome Back!'}
          </Text>
          <Text style={styles.subtitle}>
            {isSignUpMode
              ? 'Get started with InvyEasy for free'
              : 'Sign in to your InvyEasy account'}
          </Text>
        </View>

        {/* Login/Sign Up Card */}
        <ScrollView style={styles.loginCard} showsVerticalScrollIndicator={false}>
          {/* Show name and organization fields only in signup mode */}
          {isSignUpMode && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>First Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your first name"
                  placeholderTextColor="#9ca3af"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your last name"
                  placeholderTextColor="#9ca3af"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Organization Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="My Home, My Business, etc."
                  placeholderTextColor="#9ca3af"
                  value={organizationName}
                  onChangeText={setOrganizationName}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              </View>
            </>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder={isSignUpMode ? "Create a password (min 6 characters)" : "Enter your password"}
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={isSignUpMode ? handleSignUp : handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" />
                <Text style={styles.loadingText}>{isSignUpMode ? 'Signing Up...' : 'Signing In...'}</Text>
              </View>
            ) : (
              <>
                <Text style={styles.loginButtonText}>{isSignUpMode ? 'Sign Up' : 'Sign In'}</Text>
                <Text style={styles.arrow}>→</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>
              {isSignUpMode ? 'Already have an account?' : "Don't have an account?"}
            </Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Toggle Mode Button */}
          <TouchableOpacity
            style={styles.signupButton}
            onPress={() => setShowSignUp(!showSignUp)}
          >
            <Text style={styles.signupButtonText}>
              {isSignUpMode ? 'Sign In' : 'Create Account'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0C',  // Deep black base for premium feel
  },
  loginContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Translucent glass
    alignItems: 'center',
    justifyContent: 'center',
    // Glass border
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 3,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Translucent glass
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    // Orange glow shadow
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    // Glass border
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  logoText: {
    fontSize: 24,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',  // Pure white
    letterSpacing: -0.8,
    // Subtle orange glow
    textShadowColor: 'rgba(249, 115, 22, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',  // Pure white
    marginBottom: 4,
    letterSpacing: -0.8,
    // Subtle white text shadow for depth
    textShadowColor: 'rgba(255, 255, 255, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
  },
  loginCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Translucent glass
    borderRadius: 20,
    padding: 24,
    // Glass border
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',  // Almost pure white
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',  // Subtle glass border
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#FFFFFF',  // Pure white text
    backgroundColor: 'rgba(255, 255, 255, 0.12)',  // Very subtle glass
    // Subtle frosted glass input
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 1,
  },
  loginButton: {
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',  // Frosted glass
    borderRadius: 20,  // Larger radius for premium feel
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    flexDirection: 'row',
    // Orange-tinted glow
    borderWidth: 1.5,
    borderColor: 'rgba(249, 115, 22, 0.5)',  // Orange accent border
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginRight: 8,
  },
  arrow: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '700',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 12,
  },
  infoBox: {
    marginTop: 32,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.2)',
  },
  infoIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  infoText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
    flex: 1,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Subtle glass divider
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',  // Translucent white
  },
  signupButton: {
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',  // Very subtle glass
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',  // Subtle glass border
    borderRadius: 20,  // Larger radius for premium feel
    alignItems: 'center',
    justifyContent: 'center',
    // Frosted glass secondary button
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 3,
  },
  signupButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',  // Pure white
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashboardContainer: {
    flex: 1,
    backgroundColor: '#0B0B0C',  // Deep black base for premium feel
  },
  dashboardScroll: {
    flex: 1,
    position: 'relative',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  dashboardHeader: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  dashboardLogo: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Translucent glass
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    // Orange glow shadow
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
    // Glass border
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  welcomeText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
    marginTop: 8,
  },
  // Sync Status Banner Styles
  syncBanner: {
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  syncBannerOffline: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Translucent glass
    borderColor: 'rgba(239, 68, 68, 0.3)',  // Red tint
  },
  syncBannerSyncing: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Translucent glass
    borderColor: 'rgba(59, 130, 246, 0.3)',  // Blue tint
  },
  syncBannerWarning: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Translucent glass
    borderColor: 'rgba(249, 115, 22, 0.3)',  // Orange tint
  },
  syncBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  syncBannerTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  syncBannerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',  // Pure white
    flex: 1,
  },
  syncBannerSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
    marginTop: 2,
  },
  syncNowButton: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563eb',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  lastSyncText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',  // Translucent white
    marginTop: 6,
    textAlign: 'right',
  },
  welcomeBanner: {
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 8,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Translucent glass
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.3)',  // Orange tint border
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // Enhanced shadow depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  welcomeIconContainer: {
    marginRight: 12,
  },
  welcomeEmoji: {
    fontSize: 28,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',  // Pure white
    marginBottom: 2,
  },
  welcomeSubtext: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
  },
  dismissButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',  // Frosted glass
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  statsContainer: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  statCardOrange: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Translucent glass
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.3)',  // Orange tint
  },
  statCardBlue: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Translucent glass
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',  // Blue tint
  },
  statCardGreen: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Translucent glass
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',  // Green tint
  },
  statCardPurple: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Translucent glass
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',  // Purple tint
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(249, 115, 22, 0.2)',  // Orange tint glass
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.4)',
  },
  statIcon: {
    fontSize: 20,
    fontWeight: '900',
    color: '#F97316',  // Orange accent
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',  // Pure white
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
    fontWeight: '600',
  },
  syncBanner: {
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 24,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Translucent glass
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',  // Green tint
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  syncTextContainer: {
    flex: 1,
  },
  syncTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',  // Pure white
    marginBottom: 2,
  },
  syncSubtext: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
  },
  quickActionsContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',  // Pure white
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Translucent glass
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',  // Glass border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',  // Very subtle glass
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',  // Pure white
  },
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Translucent glass
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',  // Glass border
    paddingBottom: 20,
    paddingTop: 8,
    // Enhanced shadow for floating effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  tabLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',  // Translucent white
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#F97316',  // Orange accent
    fontWeight: '600',
  },
  logoutButton: {
    marginHorizontal: 24,
    marginBottom: 40,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',  // Very subtle glass
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',  // Glass border
    borderRadius: 20,  // Larger radius for premium feel
    alignItems: 'center',
    justifyContent: 'center',
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 3,
  },
  logoutButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',  // Pure white
  },
  // Inventory List Styles
  inventoryHeader: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Translucent glass
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.12)',  // Glass border
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingRight: 16,
    gap: 6,
  },
  backButtonText: {
    fontSize: 16,
    color: '#f97316',
    fontWeight: '600',
  },
  inventoryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',  // Pure white
  },
  headerSpacer: {
    width: 60,
  },
  exportButton: {
    width: 60,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  searchContainer: {
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',  // Very subtle glass
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',  // Glass border
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',  // Pure white
    height: 44,
  },
  filterContainer: {
    marginHorizontal: 24,
    marginBottom: 12,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',  // Very subtle glass
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',  // Glass border
  },
  filterChipActive: {
    backgroundColor: 'rgba(249, 115, 22, 0.2)',  // Orange tint glass
    borderColor: 'rgba(249, 115, 22, 0.5)',  // Orange border
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
  },
  filterChipTextActive: {
    color: '#F97316',  // Orange accent
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
    marginBottom: 8,
  },
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  stockFilterContainer: {
    flex: 1,
  },
  filterChipSmall: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',  // Very subtle glass
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',  // Glass border
  },
  filterChipTextSmall: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Translucent glass
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.5)',  // Orange border
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F97316',  // Orange accent
  },
  headerActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',  // Very subtle glass
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',  // Glass border
  },
  headerActionButtonActive: {
    backgroundColor: 'rgba(249, 115, 22, 0.2)',  // Orange tint glass
    borderColor: 'rgba(249, 115, 22, 0.5)',  // Orange border
  },
  headerActionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
  },
  headerActionButtonTextActive: {
    color: '#F97316',  // Orange accent
  },
  itemsCountContainer: {
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  itemsCountText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
    fontWeight: '600',
  },
  itemsList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  itemCard: {
    marginHorizontal: 24,
    marginBottom: 12,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Translucent glass
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',  // Glass border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  itemCardSelected: {
    borderColor: 'rgba(249, 115, 22, 0.5)',  // Orange border
    borderWidth: 2,
    backgroundColor: 'rgba(249, 115, 22, 0.15)',  // Orange tint glass
  },
  checkboxContainer: {
    marginRight: 12,
    justifyContent: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',  // Glass border
    backgroundColor: 'rgba(255, 255, 255, 0.12)',  // Very subtle glass
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: 'rgba(249, 115, 22, 0.8)',  // Orange with opacity
    borderColor: '#F97316',  // Orange accent
  },
  bulkActionsBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Translucent glass
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',  // Glass border
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  bulkActionsText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',  // Pure white
  },
  bulkActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',  // Very subtle glass
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.5)',  // Orange border
  },
  bulkActionButtonDanger: {
    borderColor: 'rgba(220, 38, 38, 0.5)',  // Red border
  },
  bulkActionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F97316',  // Orange accent
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',  // Darker overlay for better modal visibility
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  sortModal: {
    backgroundColor: 'rgba(11, 11, 12, 0.95)',  // Dark semi-opaque background for better visibility
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',  // Subtle glass border
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  sortModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',  // Pure white
    marginBottom: 16,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  sortOptionActive: {
    backgroundColor: 'rgba(249, 115, 22, 0.15)',  // Orange tint glass
  },
  sortOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',  // Pure white
  },
  sortOptionTextActive: {
    color: '#f97316',
    fontWeight: '600',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',  // Pure white
    marginBottom: 4,
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  itemSize: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
  },
  lastCountBadge: {
    backgroundColor: '#8B5CF615',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#8B5CF630',
  },
  lastCountBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(249, 115, 22, 0.15)',  // Orange tint glass
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.3)',
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f97316',
  },
  itemStats: {
    alignItems: 'flex-end',
  },
  itemCount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f97316',
  },
  itemCountLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
    marginTop: 2,
  },
  itemFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemPrice: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
  },
  itemTotalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',  // Pure white
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',  // Pure white
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
    textAlign: 'center',
    lineHeight: 22,
  },
  // Categories Screen Styles
  screenSubtitle: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  subtitleText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
  },
  categoriesGrid: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Translucent glass
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',  // Glass border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  supplierCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Translucent glass
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',  // Glass border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',  // Pure white
    marginBottom: 4,
    textAlign: 'center',
  },
  categoryDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
    marginBottom: 12,
  },
  categoryActions: {
    width: '100%',
    gap: 8,
  },
  categoryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
  },
  editButton: {
    backgroundColor: '#6b7280',
    shadowColor: '#6b7280',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  addButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // More/Settings Screen Styles
  moreScroll: {
    flex: 1,
  },
  moreHeader: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Translucent glass
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.12)',  // Glass border
  },
  moreSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
    marginTop: 8,
  },
  userInfoCard: {
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 16,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Translucent glass
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',  // Glass border
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  userAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',  // Pure white
    marginBottom: 4,
  },
  userRole: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
  },
  menuSection: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  menuSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Translucent glass
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',  // Glass border
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuIconGreen: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  menuIconBlue: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  menuIconPurple: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',  // Purple tint glass
  },
  menuIconGray: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',  // Very subtle glass
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',  // Pure white
  },
  signOutButton: {
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Translucent glass
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    gap: 10,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  appVersion: {
    marginHorizontal: 24,
    marginBottom: 40,
    alignItems: 'center',
  },
  appVersionText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',  // Translucent white
  },
  // Count Screen Styles
  roomSelectCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Translucent glass
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',  // Glass border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  countHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  changesIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(249, 115, 22, 0.15)',  // Orange tint glass
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.3)',
  },
  changesText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f97316',
  },
  saveButtonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 10,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  countItemCard: {
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Translucent glass
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',  // Glass border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  countItemCardChanged: {
    borderWidth: 2,
    borderColor: 'rgba(249, 115, 22, 0.3)',
    backgroundColor: 'rgba(249, 115, 22, 0.15)',  // Orange tint glass
  },
  countItemHeader: {
    marginBottom: 12,
  },
  countControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  countButtonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  countButtonSmall: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',  // Very subtle glass
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',  // Glass border
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countButtonSmallText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',  // Almost pure white
  },
  countDisplay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',  // Very subtle glass
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#f97316',
  },
  countValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',  // Pure white
  },
  countOriginal: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
    marginTop: 4,
  },
  // Modal Styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',  // Darker overlay for better modal visibility
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: 'rgba(11, 11, 12, 0.95)',  // Dark semi-opaque background for better visibility
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',  // Subtle glass border
    borderRadius: 20,
    width: '100%',
    maxWidth: 500,
    height: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  modalScroll: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.12)',  // Glass border
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',  // Pure white
  },
  modalCloseButton: {
    padding: 8,
  },
  modalBody: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',  // Almost pure white
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',  // Glass border
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#FFFFFF',  // Pure white
    backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Translucent glass
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formGroupHalf: {
    flex: 1,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',  // Glass border
    borderRadius: 10,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Translucent glass
  },
  pickerLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
    marginBottom: 8,
  },
  pickerScroll: {
    flexDirection: 'row',
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',  // Very subtle glass
    marginRight: 8,
  },
  pickerOptionSelected: {
    backgroundColor: '#f97316',
  },
  pickerOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',  // Almost pure white
  },
  pickerOptionTextSelected: {
    color: '#fff',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
  },
  modalButtonPrimary: {
    flex: 1,
    backgroundColor: '#f97316',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  modalButtonSecondary: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',  // Very subtle glass
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',  // Almost pure white
  },
  modalButtonDisabled: {
    opacity: 0.6,
  },
  // Item display enhancements
  itemBarcode: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  itemSupplier: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
    marginTop: 4,
  },
  itemEditButton: {
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(249, 115, 22, 0.15)',  // Orange tint glass
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.3)',
  },
  headerActionButton: {
    padding: 8,
  },
  scannerContent: {
    flex: 1,
  },
  scannerSection: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  scannerSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',  // Pure white
    marginBottom: 8,
  },
  scannerSectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
    marginBottom: 12,
  },
  scannerInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',  // Very subtle glass
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',  // Glass border
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',  // Pure white
  },
  scannerResults: {
    gap: 12,
  },
  scannerResultCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Translucent glass
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',  // Glass border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scannerResultBrand: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',  // Pure white
    marginBottom: 4,
  },
  scannerResultCategory: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
    marginBottom: 4,
  },
  scannerResultBarcode: {
    fontSize: 12,
    color: '#22c55e',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  scannerResultInfo: {
    alignItems: 'flex-end',
  },
  scannerResultInfoText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
  },
  scannerMoreItems: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 12,
  },
  // Orders Screen Styles
  orderSummaryContainer: {
    marginHorizontal: 24,
    marginBottom: 20,
    gap: 12,
  },
  orderSummaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  createOrderButtonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  createOrderButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  createOrderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 10,
  },
  createOrderButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  orderStatCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  orderStatValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  orderStatLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderGroupsContainer: {
    marginHorizontal: 24,
    gap: 12,
    marginBottom: 24,
  },
  orderSupplierCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Translucent glass
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',  // Glass border
    overflow: 'hidden',
  },
  orderSupplierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Translucent glass
  },
  orderSupplierName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  orderSupplierSummary: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
    marginBottom: 4,
  },
  orderSupplierEmail: {
    fontSize: 12,
    color: '#3b82f6',
  },
  orderItemsList: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',  // Glass border
    backgroundColor: 'rgba(255, 255, 255, 0.12)',  // Very subtle glass
  },
  orderItemCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.12)',
  },
  orderItemHeader: {
    marginBottom: 12,
  },
  orderItemBrand: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  orderItemCategory: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
  },
  orderItemStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderItemStat: {
    alignItems: 'center',
  },
  orderItemStatLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
    marginBottom: 4,
  },
  orderItemStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  orderItemPrice: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  orderItemPriceText: {
    fontSize: 13,
    color: '#047857',
    fontWeight: '600',
    textAlign: 'center',
  },
  orderItemRooms: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Translucent glass
    padding: 8,
    borderRadius: 6,
  },
  orderItemRoomsLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
    marginBottom: 4,
    fontWeight: '600',
  },
  orderItemRoomsText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  menuIconOrange: {
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
  },
  // Reports Screen Styles
  reportSummaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 24,
    marginTop: 20,
    gap: 12,
  },
  reportSummaryCard: {
    flex: 1,
    minWidth: '47%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  reportSummaryValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  reportSummaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
  },
  reportChartSection: {
    marginHorizontal: 24,
    marginTop: 24,
  },
  reportSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  reportChartContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Translucent glass
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportTableSection: {
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 12,
  },
  reportTableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Translucent glass
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  reportTableCell: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  reportTableCellRight: {
    alignItems: 'flex-end',
  },
  reportColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  reportTableCellText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  reportTableValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reportTableSubvalue: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
    marginTop: 2,
  },
  reportRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f97316',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportRankText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  reportStockGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  reportStockCard: {
    flex: 1,
    minWidth: '47%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  reportStockValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  reportStockLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
  },
  // Onboarding Styles
  onboardingContainer: {
    flex: 1,
    backgroundColor: '#0B0B0C',  // Deep black
  },
  onboardingScroll: {
    flex: 1,
  },
  onboardingPage: {
    width: Dimensions.get('window').width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  onboardingContent: {
    alignItems: 'center',
    gap: 20,
  },
  onboardingIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  onboardingTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',  // Pure white
    textAlign: 'center',
  },
  onboardingSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
    textAlign: 'center',
    lineHeight: 24,
  },
  pageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 40,
  },
  pageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  pageIndicatorActive: {
    width: 24,
    backgroundColor: '#f97316',
  },
  onboardingActions: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 16,
  },
  onboardingGetStartedButton: {
    height: 56,
    backgroundColor: '#f97316',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onboardingGetStartedButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
  },
  onboardingLoginButton: {
    height: 56,
    backgroundColor: 'transparent',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onboardingLoginButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#f97316',
  },

  // Modern Counting Interface Styles
  modernCountContainer: {
    padding: 12,
  },
  modernCountDisplay: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#0B0B0C',
    borderRadius: 12,
    marginBottom: 12,
  },
  modernCountValue: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',  // Pure white
    letterSpacing: -1.5,
  },
  modernCountOriginal: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',  // Translucent white
    fontWeight: '600',
    marginTop: 4,
  },
  modernQuickButtons: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  modernQuickBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  modernQuickBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modernMainControls: {
    flexDirection: 'row',
    gap: 10,
  },
  modernDecrementBtn: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  modernIncrementBtn: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  modernGradientBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Modern Dashboard Styles
  modernDashboardHeader: {
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#0B0B0C',  // Deep black base
  },
  modernLogoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modernDashboardLogo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Translucent glass
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    // Orange glow
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  modernBrandName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',  // Pure white
    letterSpacing: -0.5,
    // Subtle orange glow
    textShadowColor: 'rgba(249, 115, 22, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  modernSyncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Translucent glass
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.3)',  // Green tint border
  },
  modernSyncTextContainer: {
    flex: 1,
  },
  modernSyncTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
  },
  modernSyncSubtext: {
    fontSize: 11,
    color: '#059669',
    opacity: 0.7,
  },
  modernStatsContainer: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  modernQuickActionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  modernQuickActionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',  // Pure white
    marginBottom: 12,
  },
  modernQuickActionsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  modernQuickActionCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Dark translucent glass
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',  // Glass border
    // Enhanced shadow depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  modernQuickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  modernQuickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',  // Pure white
    textAlign: 'center',
  },

  // Modern Inventory List Styles
  modernInventoryItemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  modernCheckboxContainer: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  modernCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',  // Glass border
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B0B0C',  // Deep black
  },
  modernCheckboxChecked: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },

  // Inventory Item Card Styles
  inventoryItemCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Frosted glass
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 18,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    // Enhanced shadow depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 4,
  },
  inventoryItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.12)',  // Glass border
  },
  inventoryItemHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  inventoryItemBrand: {
    fontSize: 19,
    fontWeight: '700',
    color: '#FFFFFF',  // Pure white
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  inventoryItemCategory: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
  },
  inventoryItemLastCounted: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',  // Translucent white
    marginTop: 3,
  },
  inventoryItemHeaderRight: {
    marginTop: 2,
  },
  inventoryStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  inventoryStatusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  inventoryItemDetails: {
    marginBottom: 16,
  },
  inventoryItemDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  inventoryItemDetailLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
  },
  inventoryItemDetailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',  // Pure white
  },
  inventoryItemDetailValueBold: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',  // Pure white
    letterSpacing: -0.5,
  },
  inventoryItemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  inventoryEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    gap: 6,
  },
  inventoryEditButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F97316',
  },

  // Modern Screen Header Styles
  modernScreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#0B0B0C',  // Deep black
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.12)',
  },
  modernBackButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modernHeaderCenter: {
    flex: 1,
    marginHorizontal: 16,
  },
  modernScreenTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',  // Pure white
    letterSpacing: -0.5,
  },
  modernScreenSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',  // Translucent white
    marginTop: 2,
  },
  modernAddButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  // Modern Categories Grid
  modernCategoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    gap: 12,
  },
  modernCategoryCard: {
    width: (width - 44) / 2,
    backgroundColor: '#0B0B0C',  // Deep black
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  modernCategoryTop: {
    marginBottom: 16,
  },
  modernCategoryIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modernCategoryName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',  // Pure white
    letterSpacing: -0.3,
  },
  modernCategoryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  modernEditButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    gap: 4,
  },
  modernEditButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F97316',
  },
  modernDeleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    gap: 4,
  },
  modernDeleteButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },

  // Modern Suppliers Grid
  modernSuppliersGrid: {
    padding: 16,
    gap: 12,
  },
  modernSupplierCard: {
    backgroundColor: '#0B0B0C',  // Deep black
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  modernSupplierTop: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  modernSupplierIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modernSupplierInfo: {
    flex: 1,
    gap: 4,
  },
  modernSupplierName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',  // Pure white
    letterSpacing: -0.3,
  },
  modernSupplierEmail: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
  },
  modernSupplierDetail: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',  // Translucent white
  },

  // Modern More/Settings Screen
  modernUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Frosted glass
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    // Enhanced shadow depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  modernUserAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  modernUserAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modernUserInfo: {
    flex: 1,
  },
  modernUserName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',  // Pure white
    marginBottom: 4,
  },
  modernUserStatus: {
    fontSize: 13,
    fontWeight: '500',
    color: '#10B981',
  },
  modernMenuSection: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  modernMenuSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modernMenuGroup: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Frosted glass
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
    // Enhanced shadow depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  modernMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.12)',
  },
  modernMenuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modernMenuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modernMenuItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',  // Pure white
  },
  modernSignOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Translucent glass
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    gap: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(239, 68, 68, 0.3)',  // Red tint glass border
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  modernSignOutButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EF4444',
  },
  modernAppVersion: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 24,
  },
  modernAppVersionText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',  // Translucent white
  },

  // Modern Branded Inventory Header
  modernBrandedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#0B0B0C',  // Deep black
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.12)',
  },
  modernBrandedHeaderCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    gap: 10,
  },
  modernHeaderLogoWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modernHeaderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  modernSelectButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  modernSelectButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: '#F97316',
  },
  modernSelectButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
  },
  modernSelectButtonTextActive: {
    color: '#F97316',
  },

  // Modern Search Container
  modernSearchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0B0B0C',
  },
  modernSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B0B0C',  // Deep black
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  modernSearchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',  // Pure white
  },

  // Modern Filters Section
  modernFiltersSection: {
    backgroundColor: '#0B0B0C',
    paddingBottom: 8,
  },
  modernFilterRow: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  modernFilterLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modernFilterScroll: {
    flexDirection: 'row',
  },
  modernFilterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#0B0B0C',  // Deep black
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginRight: 8,
  },
  modernFilterPillActive: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  modernFilterPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
  },
  modernFilterPillTextActive: {
    color: '#FFFFFF',
  },
  modernFilterRowSpaced: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  modernStockFilters: {
    flex: 1,
  },
  modernStockPills: {
    flexDirection: 'row',
    gap: 6,
  },
  modernFilterPillSmall: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: '#0B0B0C',  // Deep black
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  modernFilterPillTextSmall: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
  },
  modernSortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#0B0B0C',  // Deep black
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    gap: 6,
  },
  modernSortButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F97316',
  },
  modernItemsCount: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  modernItemsCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',  // Translucent white
  },

  // Modern Login Screen
  modernLoginScroll: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modernLoginContent: {
    flexGrow: 1,
  },
  modernLoginHero: {
    height: 300,
  },
  modernLoginGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  modernLoginLogoContainer: {
    alignItems: 'center',
  },
  modernLoginLogo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  modernLoginBrandName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 8,
  },
  modernLoginTagline: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 0.3,
  },
  modernLoginCardWrapper: {
    flex: 1,
    marginTop: -40,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  modernLoginCard: {
    backgroundColor: '#0B0B0C',  // Deep black
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  modernLoginCardTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',  // Pure white
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  modernLoginCardSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
    marginBottom: 28,
    lineHeight: 22,
  },
  modernInputGroup: {
    marginBottom: 20,
  },
  modernLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',  // Almost pure white
    marginBottom: 8,
  },
  modernInputWrapper: {
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  modernInput: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',  // Pure white
  },
  modernLoginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modernLoginButtonDisabled: {
    opacity: 0.6,
  },
  modernLoginButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modernLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modernLoginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  modernDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  modernDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  modernDividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',  // Translucent white
  },
  modernSecondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
  },
  modernSecondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',  // Almost pure white
  },
  modernLoginFooter: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',  // Translucent white
    marginTop: 24,
  },
  // Shopping Cart Styles
  cartBadgeButton: {
    position: 'relative',
    padding: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  shoppingItemsGrid: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 12,
  },
  shoppingItemCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shoppingItemContent: {
    flex: 1,
    marginRight: 12,
  },
  shoppingItemBrand: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  shoppingItemCategory: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  shoppingItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  addToCartButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f97316',
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartButtonDisabled: {
    backgroundColor: '#16a34a',
  },
  addToCartButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  cartItemsContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 12,
  },
  cartItemCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    padding: 16,
  },
  cartItemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cartItemBrand: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cartItemCategory: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  removeButton: {
    padding: 8,
  },
  cartItemControls: {
    marginBottom: 12,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  quantityButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 8,
    padding: 8,
  },
  quantityButton: {
    padding: 4,
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    minWidth: 40,
    textAlign: 'center',
  },
  notesContainer: {
    marginTop: 8,
  },
  notesLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  notesInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#FFFFFF',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  cartFooter: {
    padding: 24,
  },
  reviewOrderButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  reviewOrderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 8,
  },
  reviewOrderButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  reviewContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 16,
  },
  reviewSupplierCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    padding: 16,
  },
  reviewSupplierName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  reviewSupplierItems: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 12,
  },
  reviewItemRow: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
  },
  reviewItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  reviewItemQty: {
    fontSize: 14,
    color: '#f97316',
    fontWeight: '600',
    marginBottom: 4,
  },
  reviewItemNotes: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
  },
  sendOptionsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
  },
  sendOptionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
  },
  sendButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  sendOptionButton: {
    flex: 1,
    minWidth: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  sendOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  sendAllContainer: {
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#f97316',
  },
  sendAllTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  sendAllButton: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  sendAllButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyStateButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#f97316',
    borderRadius: 10,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

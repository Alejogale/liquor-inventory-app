import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Plus,
  Truck,
  Edit3,
  Trash2,
  X,
  Check,
  Phone,
  Mail,
  User,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { supabase, useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/common';
import { colors, typography, spacing, radius } from '../../constants/theme';

interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  contact_person?: string;
  notes?: string;
  item_count?: number;
}

export const SuppliersManagement: React.FC = () => {
  const navigation = useNavigation<any>();
  const { userProfile } = useAuth();

  // Role-based access control - Only Owner/Manager can manage suppliers
  const isOwner = userProfile?.role === 'owner';
  const isManager = userProfile?.role === 'manager';
  const canManage = isOwner || isManager;

  const [isLoading, setIsLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [notes, setNotes] = useState('');

  const fetchSuppliers = useCallback(async () => {
    if (!userProfile?.organization_id) return;

    try {
      const { data: suppliersData, error: suppliersError } = await supabase
        .from('suppliers')
        .select('id, name, email, phone, contact_person, notes')
        .eq('organization_id', userProfile.organization_id)
        .order('name');

      if (suppliersError) throw suppliersError;

      // Get item counts for each supplier
      const suppliersWithCounts = await Promise.all(
        (suppliersData || []).map(async (supplier) => {
          const { count } = await supabase
            .from('inventory_items')
            .select('*', { count: 'exact', head: true })
            .eq('supplier_id', supplier.id);

          return {
            ...supplier,
            item_count: count || 0,
          };
        })
      );

      setSuppliers(suppliersWithCounts);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      Alert.alert('Error', 'Failed to load suppliers.');
    } finally {
      setIsLoading(false);
    }
  }, [userProfile?.organization_id]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  }, [navigation]);

  const resetForm = useCallback(() => {
    setName('');
    setEmail('');
    setPhone('');
    setContactPerson('');
    setNotes('');
  }, []);

  const handleAddSupplier = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setEditingSupplier(null);
    resetForm();
    setIsModalVisible(true);
  }, [resetForm]);

  const handleEditSupplier = useCallback((supplier: Supplier) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingSupplier(supplier);
    setName(supplier.name);
    setEmail(supplier.email || '');
    setPhone(supplier.phone || '');
    setContactPerson(supplier.contact_person || '');
    setNotes(supplier.notes || '');
    setIsModalVisible(true);
  }, []);

  const handleDeleteSupplier = useCallback((supplier: Supplier) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const message = supplier.item_count && supplier.item_count > 0
      ? `This supplier has ${supplier.item_count} item${supplier.item_count > 1 ? 's' : ''} assigned. Deleting will remove the supplier from those items. Continue?`
      : `Are you sure you want to delete "${supplier.name}"?`;

    Alert.alert(
      'Delete Supplier',
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('suppliers')
                .delete()
                .eq('id', supplier.id);

              if (error) throw error;

              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              fetchSuppliers();
            } catch (error) {
              console.error('Error deleting supplier:', error);
              Alert.alert('Error', 'Failed to delete supplier.');
            }
          },
        },
      ]
    );
  }, [fetchSuppliers]);

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Supplier name is required.');
      return;
    }

    if (!userProfile?.organization_id) return;

    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (editingSupplier) {
        // Update existing supplier
        const { error } = await supabase
          .from('suppliers')
          .update({
            name: name.trim(),
            email: email.trim() || null,
            phone: phone.trim() || null,
            contact_person: contactPerson.trim() || null,
            notes: notes.trim() || null,
          })
          .eq('id', editingSupplier.id);

        if (error) throw error;
      } else {
        // Create new supplier
        const { error } = await supabase
          .from('suppliers')
          .insert({
            name: name.trim(),
            email: email.trim() || null,
            phone: phone.trim() || null,
            contact_person: contactPerson.trim() || null,
            notes: notes.trim() || null,
            organization_id: userProfile.organization_id,
          });

        if (error) throw error;
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsModalVisible(false);
      resetForm();
      setEditingSupplier(null);
      fetchSuppliers();
    } catch (error) {
      console.error('Error saving supplier:', error);
      Alert.alert('Error', 'Failed to save supplier.');
    } finally {
      setIsSaving(false);
    }
  }, [name, email, phone, contactPerson, notes, editingSupplier, userProfile?.organization_id, fetchSuppliers, resetForm]);

  const handleCloseModal = useCallback(() => {
    setIsModalVisible(false);
    resetForm();
    setEditingSupplier(null);
  }, [resetForm]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner variant="branded" message="Loading suppliers..." />
        </View>
      </SafeAreaView>
    );
  }

  // Staff and Viewers cannot manage suppliers
  if (!canManage) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Suppliers</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.textSecondary, textAlign: 'center', paddingHorizontal: 20 }}>
            You don't have permission to manage suppliers. Contact your manager for access.
          </Text>
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
        <Text style={styles.title}>Suppliers</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddSupplier}>
          <Plus size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Suppliers List */}
      <FlatList
        data={suppliers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.supplierCard}>
            <View style={styles.supplierIcon}>
              <Truck size={20} color={colors.primary} />
            </View>
            <View style={styles.supplierInfo}>
              <Text style={styles.supplierName}>{item.name}</Text>
              {item.contact_person && (
                <Text style={styles.supplierDetail}>{item.contact_person}</Text>
              )}
              <Text style={styles.supplierCount}>
                {item.item_count || 0} item{item.item_count !== 1 ? 's' : ''}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditSupplier(item)}
            >
              <Edit3 size={18} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteSupplier(item)}
            >
              <Trash2 size={18} color={colors.error} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Truck size={48} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Suppliers</Text>
            <Text style={styles.emptyText}>
              Add suppliers to track where your inventory comes from.
            </Text>
          </View>
        }
      />

      {/* Add/Edit Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalContent}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleCloseModal}>
                <X size={24} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
              </Text>
              <TouchableOpacity
                onPress={handleSave}
                disabled={isSaving}
                style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              >
                <Check size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Form */}
            <ScrollView
              style={styles.form}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.inputLabel}>Supplier Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter supplier name"
                placeholderTextColor={colors.textTertiary}
                autoFocus
              />

              <Text style={styles.inputLabel}>Contact Person</Text>
              <View style={styles.inputWithIcon}>
                <User size={18} color={colors.textTertiary} />
                <TextInput
                  style={styles.inputInner}
                  value={contactPerson}
                  onChangeText={setContactPerson}
                  placeholder="Enter contact name"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>

              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputWithIcon}>
                <Mail size={18} color={colors.textTertiary} />
                <TextInput
                  style={styles.inputInner}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter email address"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <Text style={styles.inputLabel}>Phone</Text>
              <View style={styles.inputWithIcon}>
                <Phone size={18} color={colors.textTertiary} />
                <TextInput
                  style={styles.inputInner}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Enter phone number"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="phone-pad"
                />
              </View>

              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add notes..."
                placeholderTextColor={colors.textTertiary}
                multiline
                numberOfLines={4}
              />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
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
    width: 40,
    height: 40,
    borderRadius: radius.base,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: spacing.base,
    paddingBottom: spacing['3xl'],
  },
  supplierCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.sm,
  },
  supplierIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.base,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  supplierInfo: {
    flex: 1,
  },
  supplierName: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: colors.textPrimary,
  },
  supplierDetail: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  supplierCount: {
    fontSize: typography.size.xs,
    color: colors.textTertiary,
    marginTop: 2,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: radius.base,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
    marginTop: spacing.base,
  },
  emptyText: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalContent: {
    flex: 1,
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
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: radius.base,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  form: {
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
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.base,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    fontSize: typography.size.base,
    color: colors.textPrimary,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.base,
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
  },
  inputInner: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: typography.size.base,
    color: colors.textPrimary,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});

export default SuppliersManagement;

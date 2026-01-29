import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Package,
  Check,
  Tag,
  Truck,
  ScanBarcode,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { supabase, useAuth } from '../../context/AuthContext';
import { LoadingSpinner, BarcodeScanner } from '../../components/common';
import { colors, typography, spacing, radius } from '../../constants/theme';

interface Category {
  id: string;
  name: string;
}

interface Supplier {
  id: string;
  name: string;
}

export const InventoryAdd: React.FC = () => {
  const navigation = useNavigation<any>();
  const { userProfile } = useAuth();

  // Role-based access control - Viewers cannot add items
  const isViewer = userProfile?.role === 'viewer';

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Form state
  const [brand, setBrand] = useState('');
  const [barcode, setBarcode] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [price, setPrice] = useState('');
  const [threshold, setThreshold] = useState('');
  const [parLevel, setParLevel] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [supplierId, setSupplierId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!userProfile?.organization_id) return;

    try {
      // Fetch categories
      const { data: catData } = await supabase
        .from('categories')
        .select('id, name')
        .eq('organization_id', userProfile.organization_id)
        .order('name');

      if (catData) setCategories(catData);

      // Fetch suppliers
      const { data: supData } = await supabase
        .from('suppliers')
        .select('id, name')
        .eq('organization_id', userProfile.organization_id)
        .order('name');

      if (supData) setSuppliers(supData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userProfile?.organization_id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  }, [navigation]);

  const handleSave = useCallback(async () => {
    if (!brand.trim()) {
      Alert.alert('Error', 'Brand name is required.');
      return;
    }

    if (!userProfile?.organization_id) return;

    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const { error } = await supabase
        .from('inventory_items')
        .insert({
          brand: brand.trim(),
          barcode: barcode.trim() || null,
          price_per_item: parseFloat(price) || 0,
          threshold: parseInt(threshold) || 0,
          par_level: parseInt(parLevel) || 0,
          category_id: categoryId,
          supplier_id: supplierId,
          organization_id: userProfile.organization_id,
          current_stock: 0,
        });

      if (error) throw error;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Item added successfully!', [
        {
          text: 'Add Another',
          onPress: () => {
            // Reset form
            setBrand('');
            setBarcode('');
            setPrice('');
            setThreshold('');
            setParLevel('');
            setCategoryId(null);
            setSupplierId(null);
          },
        },
        {
          text: 'Done',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Error adding item:', error);
      Alert.alert('Error', 'Failed to add item.');
    } finally {
      setIsSaving(false);
    }
  }, [brand, barcode, price, threshold, parLevel, categoryId, supplierId, userProfile?.organization_id, navigation]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner variant="branded" message="Loading..." />
        </View>
      </SafeAreaView>
    );
  }

  // Viewers cannot add items
  if (isViewer) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Add Item</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.textSecondary, textAlign: 'center', paddingHorizontal: 20 }}>
            You don't have permission to add items. Contact your manager for access.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Add Item</Text>
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Check size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Basic Info */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Package size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Basic Information</Text>
            </View>

            <Text style={styles.inputLabel}>Brand Name *</Text>
            <TextInput
              style={styles.input}
              value={brand}
              onChangeText={setBrand}
              placeholder="Enter brand name"
              placeholderTextColor={colors.textTertiary}
            />

            <Text style={styles.inputLabel}>Barcode</Text>
            <View style={styles.barcodeInputRow}>
              <TextInput
                style={[styles.input, styles.barcodeInput]}
                value={barcode}
                onChangeText={setBarcode}
                placeholder="Enter barcode"
                placeholderTextColor={colors.textTertiary}
              />
              <TouchableOpacity
                style={styles.scanIconButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setShowScanner(true);
                }}
              >
                <ScanBarcode size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Pricing & Stock */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Package size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Pricing & Stock Levels</Text>
            </View>

            <Text style={styles.inputLabel}>Price per Item</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="0.00"
              placeholderTextColor={colors.textTertiary}
              keyboardType="decimal-pad"
            />

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Low Stock Threshold</Text>
                <TextInput
                  style={styles.input}
                  value={threshold}
                  onChangeText={setThreshold}
                  placeholder="0"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Par Level</Text>
                <TextInput
                  style={styles.input}
                  value={parLevel}
                  onChangeText={setParLevel}
                  placeholder="0"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="number-pad"
                />
              </View>
            </View>
          </View>

          {/* Category */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Tag size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Category</Text>
            </View>

            <View style={styles.optionsList}>
              <TouchableOpacity
                style={[
                  styles.optionItem,
                  !categoryId && styles.optionItemActive,
                ]}
                onPress={() => setCategoryId(null)}
              >
                <Text style={[
                  styles.optionText,
                  !categoryId && styles.optionTextActive,
                ]}>None</Text>
              </TouchableOpacity>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.optionItem,
                    categoryId === cat.id && styles.optionItemActive,
                  ]}
                  onPress={() => setCategoryId(cat.id)}
                >
                  <Text style={[
                    styles.optionText,
                    categoryId === cat.id && styles.optionTextActive,
                  ]}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {categories.length === 0 && (
              <Text style={styles.helperText}>
                No categories yet. Add them from the More menu.
              </Text>
            )}
          </View>

          {/* Supplier */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Truck size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Supplier</Text>
            </View>

            <View style={styles.optionsList}>
              <TouchableOpacity
                style={[
                  styles.optionItem,
                  !supplierId && styles.optionItemActive,
                ]}
                onPress={() => setSupplierId(null)}
              >
                <Text style={[
                  styles.optionText,
                  !supplierId && styles.optionTextActive,
                ]}>None</Text>
              </TouchableOpacity>
              {suppliers.map((sup) => (
                <TouchableOpacity
                  key={sup.id}
                  style={[
                    styles.optionItem,
                    supplierId === sup.id && styles.optionItemActive,
                  ]}
                  onPress={() => setSupplierId(sup.id)}
                >
                  <Text style={[
                    styles.optionText,
                    supplierId === sup.id && styles.optionTextActive,
                  ]}>{sup.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {suppliers.length === 0 && (
              <Text style={styles.helperText}>
                No suppliers yet. Add them from the More menu.
              </Text>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={(scannedBarcode) => {
          setBarcode(scannedBarcode);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.base,
    paddingBottom: spacing['3xl'],
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
  },
  inputLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: radius.base,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    fontSize: typography.size.base,
    color: colors.textPrimary,
  },
  barcodeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  barcodeInput: {
    flex: 1,
  },
  scanIconButton: {
    width: 48,
    height: 48,
    borderRadius: radius.base,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  optionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optionItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.full,
  },
  optionItemActive: {
    backgroundColor: colors.primary,
  },
  optionText: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  optionTextActive: {
    color: colors.textPrimary,
    fontWeight: typography.weight.medium,
  },
  helperText: {
    fontSize: typography.size.sm,
    color: colors.textTertiary,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
});

export default InventoryAdd;

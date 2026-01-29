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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Plus,
  Tag,
  Edit3,
  Trash2,
  X,
  Check,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { supabase, useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/common';
import { colors, typography, spacing, radius } from '../../constants/theme';

interface Category {
  id: string;
  name: string;
  item_count?: number;
}

export const CategoriesManagement: React.FC = () => {
  const navigation = useNavigation<any>();
  const { userProfile } = useAuth();

  // Role-based access control - Only Owner/Manager can manage categories
  const isOwner = userProfile?.role === 'owner';
  const isManager = userProfile?.role === 'manager';
  const canManage = isOwner || isManager;

  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchCategories = useCallback(async () => {
    if (!userProfile?.organization_id) return;

    try {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name')
        .eq('organization_id', userProfile.organization_id)
        .order('name');

      if (categoriesError) throw categoriesError;

      // Get item counts for each category
      const categoriesWithCounts = await Promise.all(
        (categoriesData || []).map(async (category) => {
          const { count } = await supabase
            .from('inventory_items')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id);

          return {
            ...category,
            item_count: count || 0,
          };
        })
      );

      setCategories(categoriesWithCounts);
    } catch (error) {
      console.error('Error fetching categories:', error);
      Alert.alert('Error', 'Failed to load categories.');
    } finally {
      setIsLoading(false);
    }
  }, [userProfile?.organization_id]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  }, [navigation]);

  const handleAddCategory = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setEditingCategory(null);
    setCategoryName('');
    setIsModalVisible(true);
  }, []);

  const handleEditCategory = useCallback((category: Category) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingCategory(category);
    setCategoryName(category.name);
    setIsModalVisible(true);
  }, []);

  const handleDeleteCategory = useCallback((category: Category) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (category.item_count && category.item_count > 0) {
      Alert.alert(
        'Cannot Delete',
        `This category has ${category.item_count} item${category.item_count > 1 ? 's' : ''} assigned to it. Please reassign or delete those items first.`
      );
      return;
    }

    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', category.id);

              if (error) throw error;

              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              fetchCategories();
            } catch (error) {
              console.error('Error deleting category:', error);
              Alert.alert('Error', 'Failed to delete category.');
            }
          },
        },
      ]
    );
  }, [fetchCategories]);

  const handleSave = useCallback(async () => {
    if (!categoryName.trim()) {
      Alert.alert('Error', 'Category name is required.');
      return;
    }

    if (!userProfile?.organization_id) return;

    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (editingCategory) {
        // Update existing category
        const { error } = await supabase
          .from('categories')
          .update({ name: categoryName.trim() })
          .eq('id', editingCategory.id);

        if (error) throw error;
      } else {
        // Create new category
        const { error } = await supabase
          .from('categories')
          .insert({
            name: categoryName.trim(),
            organization_id: userProfile.organization_id,
          });

        if (error) throw error;
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsModalVisible(false);
      setCategoryName('');
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      Alert.alert('Error', 'Failed to save category.');
    } finally {
      setIsSaving(false);
    }
  }, [categoryName, editingCategory, userProfile?.organization_id, fetchCategories]);

  const handleCloseModal = useCallback(() => {
    setIsModalVisible(false);
    setCategoryName('');
    setEditingCategory(null);
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner variant="branded" message="Loading categories..." />
        </View>
      </SafeAreaView>
    );
  }

  // Staff and Viewers cannot manage categories
  if (!canManage) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Categories</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.textSecondary, textAlign: 'center', paddingHorizontal: 20 }}>
            You don't have permission to manage categories. Contact your manager for access.
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
        <Text style={styles.title}>Categories</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddCategory}>
          <Plus size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Categories List */}
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.categoryCard}>
            <View style={styles.categoryIcon}>
              <Tag size={20} color={colors.primary} />
            </View>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName}>{item.name}</Text>
              <Text style={styles.categoryCount}>
                {item.item_count || 0} item{item.item_count !== 1 ? 's' : ''}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditCategory(item)}
            >
              <Edit3 size={18} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteCategory(item)}
            >
              <Trash2 size={18} color={colors.error} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Tag size={48} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Categories</Text>
            <Text style={styles.emptyText}>
              Add categories to organize your inventory items.
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
                {editingCategory ? 'Edit Category' : 'Add Category'}
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
            <View style={styles.form}>
              <Text style={styles.inputLabel}>Category Name</Text>
              <TextInput
                style={styles.input}
                value={categoryName}
                onChangeText={setCategoryName}
                placeholder="Enter category name"
                placeholderTextColor={colors.textTertiary}
                autoFocus
              />
            </View>
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
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.sm,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.base,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: colors.textPrimary,
  },
  categoryCount: {
    fontSize: typography.size.sm,
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
    padding: spacing.base,
  },
  inputLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.base,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    fontSize: typography.size.base,
    color: colors.textPrimary,
  },
});

export default CategoriesManagement;

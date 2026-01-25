import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  ArrowLeft,
  GripVertical,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { supabase, useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/common';
import { colors, typography, spacing, radius } from '../../constants/theme';

interface Room {
  id: string;
  name: string;
  display_order: number;
}

export const RoomsManagement: React.FC = () => {
  const navigation = useNavigation<any>();
  const { userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomName, setRoomName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchRooms = useCallback(async () => {
    if (!userProfile?.organization_id) return;

    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('id, name, display_order')
        .eq('organization_id', userProfile.organization_id)
        .order('display_order');

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      Alert.alert('Error', 'Failed to load rooms.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [userProfile?.organization_id]);

  useEffect(() => {
    if (userProfile?.organization_id) {
      fetchRooms();
    }
  }, [userProfile?.organization_id, fetchRooms]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchRooms();
  }, [fetchRooms]);

  const handleAddRoom = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setEditingRoom(null);
    setRoomName('');
    setShowModal(true);
  }, []);

  const handleEditRoom = useCallback((room: Room) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingRoom(room);
    setRoomName(room.name);
    setShowModal(true);
  }, []);

  const handleDeleteRoom = useCallback((room: Room) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Delete Room',
      `Are you sure you want to delete "${room.name}"? This will also delete all counts for this room.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('rooms')
                .delete()
                .eq('id', room.id);

              if (error) throw error;

              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              fetchRooms();
            } catch (error) {
              console.error('Error deleting room:', error);
              Alert.alert('Error', 'Failed to delete room.');
            }
          },
        },
      ]
    );
  }, [fetchRooms]);

  const handleSaveRoom = useCallback(async () => {
    if (!roomName.trim()) {
      Alert.alert('Error', 'Please enter a room name.');
      return;
    }

    if (!userProfile?.organization_id) return;

    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (editingRoom) {
        // Update existing room
        const { error } = await supabase
          .from('rooms')
          .update({ name: roomName.trim() })
          .eq('id', editingRoom.id);

        if (error) throw error;
      } else {
        // Create new room
        const maxOrder = rooms.length > 0
          ? Math.max(...rooms.map(r => r.display_order))
          : 0;

        const { error } = await supabase
          .from('rooms')
          .insert({
            name: roomName.trim(),
            display_order: maxOrder + 1,
            organization_id: userProfile.organization_id,
          });

        if (error) throw error;
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowModal(false);
      setRoomName('');
      setEditingRoom(null);
      fetchRooms();
    } catch (error) {
      console.error('Error saving room:', error);
      Alert.alert('Error', 'Failed to save room.');
    } finally {
      setIsSaving(false);
    }
  }, [roomName, editingRoom, rooms, userProfile, fetchRooms]);

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  }, [navigation]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner variant="branded" message="Loading rooms..." />
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
        <Text style={styles.title}>Rooms</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddRoom}>
          <Plus size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Rooms List */}
      <FlatList
        data={rooms}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        renderItem={({ item: room }) => (
          <View style={styles.roomCard}>
            <View style={styles.roomIcon}>
              <Building2 size={24} color={colors.primary} />
            </View>
            <View style={styles.roomContent}>
              <Text style={styles.roomName}>{room.name}</Text>
            </View>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditRoom(room)}
            >
              <Edit2 size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteRoom(room)}
            >
              <Trash2 size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Building2 size={48} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Rooms</Text>
            <Text style={styles.emptyText}>
              Add rooms to organize your inventory counting.
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleAddRoom}>
              <Plus size={20} color={colors.textPrimary} />
              <Text style={styles.emptyButtonText}>Add Room</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Add/Edit Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingRoom ? 'Edit Room' : 'Add Room'}
              </Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowModal(false)}
              >
                <X size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Room Name</Text>
            <TextInput
              style={styles.input}
              value={roomName}
              onChangeText={setRoomName}
              placeholder="e.g., Main Bar, Storage Room"
              placeholderTextColor={colors.textTertiary}
              autoFocus
            />

            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              onPress={handleSaveRoom}
              disabled={isSaving}
            >
              <Check size={20} color={colors.textPrimary} />
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Saving...' : editingRoom ? 'Update Room' : 'Add Room'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
    fontSize: typography.size['xl'],
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
  listContent: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing['3xl'],
  },
  roomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.md,
  },
  roomIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.base,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  roomContent: {
    flex: 1,
  },
  roomName: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
  },
  actionButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingHorizontal: spacing.xl,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.base,
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  emptyButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingBottom: spacing['3xl'],
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  modalTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: radius.base,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    fontSize: typography.size.base,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.base,
    gap: spacing.sm,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
  },
});

export default RoomsManagement;

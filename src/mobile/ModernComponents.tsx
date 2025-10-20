import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Plus,
  Minus,
  Check,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Modern Compact Dashboard Stats Card
export const StatCard = ({ icon: Icon, label, value, trend, color }: any) => (
  <View style={styles.statCard}>
    <View style={[styles.statIconContainer, { backgroundColor: `${color}15` }]}>
      <Icon color={color} size={18} strokeWidth={2.5} />
    </View>
    <View style={styles.statContent}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statValueRow}>
        <Text style={styles.statValue}>{value}</Text>
        {trend && (
          <View style={[styles.trendBadge, { backgroundColor: trend > 0 ? '#10B98115' : '#EF444415' }]}>
            {trend > 0 ? (
              <TrendingUp color="#10B981" size={12} strokeWidth={2.5} />
            ) : (
              <TrendingDown color="#EF4444" size={12} strokeWidth={2.5} />
            )}
            <Text style={[styles.trendText, { color: trend > 0 ? '#10B981' : '#EF4444' }]}>
              {Math.abs(trend)}%
            </Text>
          </View>
        )}
      </View>
    </View>
  </View>
);

// Modern Quick Count Buttons Component
export const QuickCountButtons = ({ onAdd }: { onAdd: (amount: number) => void }) => {
  const buttons = [
    { value: 0.25, label: '¼', color: '#8B5CF6' },
    { value: 0.5, label: '½', color: '#EC4899' },
    { value: 1, label: '1', color: '#3B82F6' },
    { value: 5, label: '5', color: '#10B981' },
    { value: 10, label: '10', color: '#F59E0B' },
  ];

  return (
    <View style={styles.quickButtonsContainer}>
      <Text style={styles.quickButtonsLabel}>Quick Add</Text>
      <View style={styles.quickButtonsRow}>
        {buttons.map((btn) => (
          <TouchableOpacity
            key={btn.value}
            style={[styles.quickButton, { backgroundColor: `${btn.color}15`, borderColor: `${btn.color}30` }]}
            onPress={() => onAdd(btn.value)}
            activeOpacity={0.7}
          >
            <Text style={[styles.quickButtonText, { color: btn.color }]}>+{btn.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// Modern Counting Interface
export const CountingInterface = ({
  itemName,
  currentCount,
  onIncrement,
  onDecrement,
  onSave,
  onBack
}: {
  itemName: string;
  currentCount: number;
  onIncrement: (amount: number) => void;
  onDecrement: (amount: number) => void;
  onSave: () => void;
  onBack: () => void;
}) => {
  return (
    <View style={styles.countingContainer}>
      {/* Header */}
      <View style={styles.countingHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft color="#FFFFFF" size={24} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.countingTitle} numberOfLines={1}>{itemName}</Text>
        <TouchableOpacity onPress={onSave} style={styles.saveButton}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.saveButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Check color="#FFFFFF" size={20} strokeWidth={3} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Count Display */}
      <View style={styles.countDisplay}>
        <Text style={styles.countNumber}>{currentCount.toFixed(2)}</Text>
        <Text style={styles.countLabel}>Current Count</Text>
      </View>

      {/* Quick Add Buttons */}
      <QuickCountButtons onAdd={onIncrement} />

      {/* Main Controls */}
      <View style={styles.mainControls}>
        <TouchableOpacity
          style={styles.decrementButton}
          onPress={() => onDecrement(1)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#EF4444', '#DC2626']}
            style={styles.controlButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Minus color="#FFFFFF" size={32} strokeWidth={3} />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.incrementButton}
          onPress={() => onIncrement(1)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#3B82F6', '#2563EB']}
            style={styles.controlButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Plus color="#FFFFFF" size={32} strokeWidth={3} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Modern Item Card for Lists
export const ItemCard = ({ item, onPress, showStatus = true }: any) => {
  const isLow = item.total_count <= item.threshold;
  const isCritical = item.total_count === 0;

  return (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.itemCardContent}>
        <View style={styles.itemCardLeft}>
          <Text style={styles.itemCardName}>{item.brand}</Text>
          <Text style={styles.itemCardCategory}>{item.categories?.name || 'Uncategorized'}</Text>
          {item.size && (
            <Text style={styles.itemCardSize}>{item.size}</Text>
          )}
        </View>
        <View style={styles.itemCardRight}>
          {showStatus && (
            <>
              {isCritical ? (
                <View style={[styles.statusBadge, { backgroundColor: 'rgba(255, 255, 255, 0.08)' }]}>
                  <AlertTriangle color="#DC2626" size={14} strokeWidth={2.5} />
                  <Text style={[styles.statusText, { color: '#DC2626' }]}>Out</Text>
                </View>
              ) : isLow ? (
                <View style={[styles.statusBadge, { backgroundColor: 'rgba(255, 255, 255, 0.08)' }]}>
                  <AlertTriangle color="#D97706" size={14} strokeWidth={2.5} />
                  <Text style={[styles.statusText, { color: '#D97706' }]}>Low</Text>
                </View>
              ) : (
                <View style={[styles.statusBadge, { backgroundColor: 'rgba(255, 255, 255, 0.08)' }]}>
                  <Check color="#059669" size={14} strokeWidth={2.5} />
                  <Text style={[styles.statusText, { color: '#059669' }]}>Good</Text>
                </View>
              )}
            </>
          )}
          <Text style={styles.itemCardCount}>{item.total_count || 0}</Text>
          <Text style={styles.itemCardCountLabel}>in stock</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Stat Card Styles
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Frosted glass
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    // Enhanced shadow depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    marginBottom: 2,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Quick Count Buttons
  quickButtonsContainer: {
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  quickButtonsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 12,
    textAlign: 'center',
  },
  quickButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  quickButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  quickButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },

  // Counting Interface
  countingContainer: {
    flex: 1,
    backgroundColor: '#0B0B0C',  // Deep black base
  },
  countingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Frosted glass
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.12)',
    // Subtle shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',  // Frosted glass
    alignItems: 'center',
    justifyContent: 'center',
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  countingTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginHorizontal: 12,
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countDisplay: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: 'transparent',  // Transparent background
    marginBottom: 20,
    marginHorizontal: 20,
    borderRadius: 20,
  },
  countNumber: {
    fontSize: 64,
    fontWeight: '900',
    color: '#F97316',  // Orange
    letterSpacing: -2,
    textShadowColor: 'rgba(249, 115, 22, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  countLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
  },
  mainControls: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginTop: 'auto',
    paddingBottom: 40,
  },
  decrementButton: {
    flex: 1,
    height: 80,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  incrementButton: {
    flex: 1,
    height: 80,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  controlButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Item Card
  itemCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Frosted glass
    borderRadius: 14,
    marginHorizontal: 0,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    // Enhanced shadow depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  itemCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
  },
  itemCardLeft: {
    flex: 1,
    marginRight: 16,
  },
  itemCardName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  itemCardCategory: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
    marginBottom: 3,
  },
  itemCardSize: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  itemCardRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  itemCardCount: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F97316',  // Orange
    textShadowColor: 'rgba(249, 115, 22, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  itemCardCountLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
  },
});

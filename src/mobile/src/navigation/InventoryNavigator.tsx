import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  Home,
  Package,
  ClipboardList,
  Menu,
} from 'lucide-react-native';
import type { InventoryTabParamList } from './types';
import { colors, typography, spacing } from '../constants/theme';

// Screens
import InventoryDashboard from '../screens/inventory/InventoryDashboard';
import InventoryList from '../screens/inventory/InventoryList';
import InventoryCount from '../screens/inventory/InventoryCount';
import InventoryMore from '../screens/inventory/InventoryMore';

const Tab = createBottomTabNavigator<InventoryTabParamList>();

export const InventoryNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={InventoryDashboard}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Inventory"
        component={InventoryList}
        options={{
          tabBarLabel: 'Items',
          tabBarIcon: ({ color, size }) => (
            <Package size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Count"
        component={InventoryCount}
        options={{
          tabBarLabel: 'Count',
          tabBarIcon: ({ color, size }) => (
            <ClipboardList size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="More"
        component={InventoryMore}
        options={{
          tabBarLabel: 'More',
          tabBarIcon: ({ color, size }) => (
            <Menu size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.glassBorder,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
  },
  tabItem: {
    gap: 4,
  },
});

export default InventoryNavigator;

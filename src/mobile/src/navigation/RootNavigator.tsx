import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { RootStackParamList } from './types';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { colors } from '../constants/theme';

// Screens
import SplashScreen from '../screens/SplashScreen';
import AuthStack from './AuthStack';
import AppPickerScreen from '../screens/appPicker/AppPickerScreen';
import PaywallScreen from '../screens/paywall/PaywallScreen';
import ConsumptionDashboard from '../screens/consumption/ConsumptionDashboard';
import ConsumptionSettings from '../screens/consumption/ConsumptionSettings';
import InventoryNavigator from './InventoryNavigator';
import RoomsManagement from '../screens/inventory/RoomsManagement';
import InventoryDetail from '../screens/inventory/InventoryDetail';
import CategoriesManagement from '../screens/inventory/CategoriesManagement';
import InventoryAdd from '../screens/inventory/InventoryAdd';
import SuppliersManagement from '../screens/inventory/SuppliersManagement';
import Reports from '../screens/inventory/Reports';
import TeamManagement from '../screens/inventory/TeamManagement';

const Stack = createNativeStackNavigator<RootStackParamList>();

interface RootNavigatorProps {
  // Skip splash screen (for when embedded in existing app)
  skipSplash?: boolean;
}

// Inner navigator that uses auth context
const NavigatorContent: React.FC<{ skipSplash: boolean }> = ({ skipSplash }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(!skipSplash);

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  // Show splash overlay while loading
  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  // Show loading screen while checking auth
  if (isLoading) {
    return <View style={styles.empty} />;
  }

  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: colors.primary,
          background: colors.background,
          card: colors.surface,
          text: colors.textPrimary,
          border: colors.glassBorder,
          notification: colors.primary,
        },
        fonts: {
          regular: {
            fontFamily: 'System',
            fontWeight: 'normal',
          },
          medium: {
            fontFamily: 'System',
            fontWeight: '500',
          },
          bold: {
            fontFamily: 'System',
            fontWeight: 'bold',
          },
          heavy: {
            fontFamily: 'System',
            fontWeight: '800',
          },
        },
      }}
    >
      <Stack.Navigator
        initialRouteName={isAuthenticated ? 'AppPicker' : 'Auth'}
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
          animation: 'fade',
        }}
      >
        {/* Auth Flow */}
        <Stack.Screen
          name="Auth"
          component={AuthStack}
          options={{
            gestureEnabled: false,
          }}
        />

        {/* App Picker */}
        <Stack.Screen
          name="AppPicker"
          component={AppPickerScreen}
          options={{
            gestureEnabled: false,
          }}
        />

        {/* Paywall */}
        <Stack.Screen
          name="Paywall"
          component={PaywallScreen}
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />

        {/* Consumption Dashboard */}
        <Stack.Screen
          name="ConsumptionDashboard"
          component={ConsumptionDashboard}
          options={{
            animation: 'slide_from_right',
          }}
        />

        {/* Consumption Settings */}
        <Stack.Screen
          name="ConsumptionSettings"
          component={ConsumptionSettings}
          options={{
            animation: 'slide_from_right',
          }}
        />

        {/* Inventory App */}
        <Stack.Screen
          name="InventoryApp"
          component={InventoryNavigator}
          options={{
            animation: 'slide_from_right',
            gestureEnabled: false,
          }}
        />

        {/* Rooms Management */}
        <Stack.Screen
          name="RoomsManagement"
          component={RoomsManagement}
          options={{
            animation: 'slide_from_right',
          }}
        />

        {/* Inventory Detail */}
        <Stack.Screen
          name="InventoryDetail"
          component={InventoryDetail}
          options={{
            animation: 'slide_from_right',
          }}
        />

        {/* Categories Management */}
        <Stack.Screen
          name="CategoriesManagement"
          component={CategoriesManagement}
          options={{
            animation: 'slide_from_right',
          }}
        />

        {/* Add Item */}
        <Stack.Screen
          name="InventoryAdd"
          component={InventoryAdd}
          options={{
            animation: 'slide_from_right',
          }}
        />

        {/* Suppliers Management */}
        <Stack.Screen
          name="SuppliersManagement"
          component={SuppliersManagement}
          options={{
            animation: 'slide_from_right',
          }}
        />

        {/* Reports */}
        <Stack.Screen
          name="Reports"
          component={Reports}
          options={{
            animation: 'slide_from_right',
          }}
        />

        {/* Team Management */}
        <Stack.Screen
          name="TeamManagement"
          component={TeamManagement}
          options={{
            animation: 'slide_from_right',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export const RootNavigator: React.FC<RootNavigatorProps> = ({
  skipSplash = false,
}) => {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigatorContent skipSplash={skipSplash} />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  empty: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export default RootNavigator;

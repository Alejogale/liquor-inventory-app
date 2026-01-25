import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

// Root Stack
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList> | undefined;
  AppPicker: undefined;
  Paywall: {
    appName: string;
    reason?: 'trial_expired' | 'feature_limit' | 'upgrade_required';
  };
  InventoryApp: NavigatorScreenParams<InventoryTabParamList> | undefined;
  InventoryDetail: { itemId: string };
  InventoryAdd: undefined;
  RoomsManagement: undefined;
  CategoriesManagement: undefined;
  SuppliersManagement: undefined;
  Reports: undefined;
  TeamManagement: undefined;
  ConsumptionDashboard: undefined;
  ConsumptionSettings: undefined;
  ConsumptionApp: NavigatorScreenParams<ConsumptionTabParamList> | undefined;
};

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

// Inventory Tab Navigator
export type InventoryTabParamList = {
  Dashboard: undefined;
  Inventory: undefined;
  Count: undefined;
  More: undefined;
};

// Inventory Stack (within tabs)
export type InventoryStackParamList = {
  InventoryList: undefined;
  InventoryDetail: { itemId: string };
  AddItem: undefined;
  EditItem: { itemId: string };
  BarcodeScanner: undefined;
  Categories: undefined;
  Rooms: undefined;
  Suppliers: undefined;
  Orders: undefined;
  Team: undefined;
  Settings: undefined;
};

// Consumption Tab Navigator
export type ConsumptionTabParamList = {
  ConsumptionDashboard: undefined;
  Events: undefined;
  Counting: undefined;
  Settings: undefined;
};

// Consumption Stack (within tabs)
export type ConsumptionStackParamList = {
  EventsList: undefined;
  EventDetail: { eventId: string };
  CreateEvent: undefined;
  CountingScreen: { eventId: string; categoryId?: string };
  CategorySettings: undefined;
  ItemSettings: undefined;
};

// Screen Props Helpers
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<AuthStackParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type InventoryTabScreenProps<T extends keyof InventoryTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<InventoryTabParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type ConsumptionTabScreenProps<T extends keyof ConsumptionTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<ConsumptionTabParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

// Global navigation type declaration for useNavigation
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

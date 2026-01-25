import { registerRootComponent } from 'expo';

// Switch between old and new UI
// import App from './App';      // Original UI
import App from './NewApp';      // New fintech-style UI

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

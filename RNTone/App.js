import { Navigation } from 'react-native-navigation';
import { Provider } from 'react-redux';

import LoginScreen from './src/screens/Login/Login';
import Main from './src/screens/Main/Main';
import configureStore from './src/store/configureStore';

const store = configureStore();


Navigation.registerComponent(
  "Toane.LoginScreen",
  () => LoginScreen,
  store,
  Provider
)

Navigation.registerComponent(
  "Toane.MainScreen",
  () => Main,
  store,
  Provider
)

Navigation.startSingleScreenApp({
  screen: {
    screen: "Toane.LoginScreen",
    navigatorStyle: {
      navBarHidden: true
    }
  }
})


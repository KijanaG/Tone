import { Navigation } from 'react-native-navigation';
import { Provider } from 'react-redux';

import LoginScreen from './src/screens/Login/Login';
import Main from './src/screens/Main/Main';
import configureStore from './src/store/configureStore';

const store = configureStore();


Navigation.registerComponent(
  "Tone.LoginScreen",
  () => LoginScreen,
  store,
  Provider
)

Navigation.registerComponent(
  "Tone.MainScreen",
  () => Main,
  store,
  Provider
)

Navigation.startSingleScreenApp({
  screen: {
    screen: "Tone.LoginScreen",
    navigatorStyle: {
      navBarHidden: true
    }
  }
})


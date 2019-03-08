import React, {Component} from 'react';
// import { StyleSheet, Text, View} from 'react-native';
import { Navigation } from 'react-native-navigation';
// import { Provider } from 'react-redux';

import LoginScreen from './src/screens/Login/Login';
import Main from './src/screens/Main/Main';

// const store = configureStore();

Navigation.registerComponent(
  "Tone.LoginScreen",
  () => LoginScreen
)

Navigation.registerComponent(
  "Tone.MainScreen",
  () => Main
)

Navigation.startSingleScreenApp({
  screen: {
    screen: "Tone.LoginScreen",
    navigatorStyle: {
      navBarHidden: true
    }
  }
})


// App.js
import React from 'react';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import HomePage from './screens/HomePage';
import RegisterScreen from './screens/RegisterScreen';
import AddEventScreen from './screens/AddEventScreen';

const AppNavigator = createStackNavigator(
  {
    Login: LoginScreen,
    Home: HomeScreen,
    Pagehome:HomePage,
    Signup:RegisterScreen,
    PostEvent: AddEventScreen
  },
  {
    initialRouteName: 'Pagehome',
  }
);

export default createAppContainer(AppNavigator);

// App.js
import React from 'react';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import HomePage from './screens/HomePage';
import RegisterScreen from './screens/RegisterScreen';
import AddEventScreen from './screens/AddEventScreen';
import RequestsList from './screens/RequestsList';
import MyEvents from './screens/MyEvents';
import Requests from './screens/file';
import ProfileScreen from './screens/ProfileView';

const AppNavigator = createStackNavigator(
  {
    Login: LoginScreen,
    Home: HomeScreen,
    Pagehome:HomePage,
    Signup:RegisterScreen,
    PostEvent: AddEventScreen,
    Demandes: RequestsList,
    MyEvents:MyEvents,
    profile:ProfileScreen,
    req:Requests,
    
  },
  {
    initialRouteName: 'Pagehome',
  }
);

export default createAppContainer(AppNavigator);

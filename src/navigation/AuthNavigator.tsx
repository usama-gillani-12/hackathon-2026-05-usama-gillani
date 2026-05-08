import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types/navigation';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignupScreen } from '../screens/auth/SignupScreen';

const Auth = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => (
  <Auth.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
    <Auth.Screen name="Login" component={LoginScreen} />
    <Auth.Screen name="SignUp" component={SignupScreen} />
  </Auth.Navigator>
);

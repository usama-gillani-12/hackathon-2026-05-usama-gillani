import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@t/navigation';
import { LoginScreen } from '@features/auth/login';
import { SignupScreen } from '@features/auth/signup';

const Auth = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => (
  <Auth.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
    <Auth.Screen name="Login" component={LoginScreen} />
    <Auth.Screen name="SignUp" component={SignupScreen} />
  </Auth.Navigator>
);

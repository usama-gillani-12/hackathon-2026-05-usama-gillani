declare module 'react-native-vector-icons/MaterialCommunityIcons' {
  import React from 'react';
  import { TextStyle, ViewStyle } from 'react-native';

  interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: TextStyle | ViewStyle;
  }

  const MaterialCommunityIcons: React.FC<IconProps>;
  export default MaterialCommunityIcons;
}

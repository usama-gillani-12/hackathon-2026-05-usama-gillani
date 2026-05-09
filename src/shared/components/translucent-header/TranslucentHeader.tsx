import React from 'react';
import { Text, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { typography } from '@theme/typography';
import { styles } from './TranslucentHeader.styles';

interface Props {
  title?: string;
  /** Left slot — typically a back button icon */
  left?: React.ReactNode;
  /** Right slot — action icons */
  right?: React.ReactNode;
  style?: ViewStyle;
  /**
   * Render without background/shadow — use when the header sits on top of a
   * full-bleed hero image and needs to be see-through.
   */
  transparent?: boolean;
}

/**
 * iOS-native-style navigation bar.
 * Solid: white background with a soft bottom glow (shadow.nav).
 * Transparent: no background — float over hero images with a dark title.
 */
export const TranslucentHeader: React.FC<Props> = ({
  title,
  left,
  right,
  style,
  transparent = false,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top },
        transparent ? styles.transparent : styles.solid,
        style,
      ]}
    >
      <View style={styles.bar}>
        <View style={styles.side}>{left ?? null}</View>
        {title ? (
          <Text style={[typography.h2, styles.title]} numberOfLines={1}>
            {title}
          </Text>
        ) : (
          <View style={{ flex: 1 }} />
        )}
        <View style={styles.side}>{right ?? null}</View>
      </View>
    </View>
  );
};


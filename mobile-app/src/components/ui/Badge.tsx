import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, typography, spacing } from '../../constants/theme';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  default: { bg: colors.surfaceSecondary, text: colors.textSecondary },
  success: { bg: '#D1FAE5', text: '#065F46' },
  warning: { bg: '#FEF3C7', text: '#92400E' },
  error: { bg: '#FEE2E2', text: '#991B1B' },
  info: { bg: '#DBEAFE', text: '#1E40AF' },
};

export function Badge({ text, variant = 'default', size = 'md', style }: BadgeProps) {
  const colorConfig = variantColors[variant];

  return (
    <View
      style={[
        styles.base,
        styles[`size_${size}`],
        { backgroundColor: colorConfig.bg },
        style,
      ]}
    >
      <Text style={[styles.text, styles[`text_${size}`], { color: colorConfig.text }]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: borderRadius.full,
  },
  size_sm: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  size_md: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
  },
  text: {
    fontWeight: '500',
  },
  text_sm: {
    fontSize: typography.caption.fontSize,
  },
  text_md: {
    fontSize: typography.bodySmall.fontSize,
  },
});

export default Badge;

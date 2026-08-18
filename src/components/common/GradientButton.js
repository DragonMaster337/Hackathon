import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, borderRadius, typography, shadows, spacing } from '../../theme';

export default function GradientButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary', // 'primary' | 'outline' | 'ghost'
  icon,
  style,
}) {
  if (variant === 'outline') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.outlineButton, disabled && styles.disabled, style]}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <View style={styles.content}>
            {icon && <View style={styles.iconWrap}>{icon}</View>}
            <Text style={[typography.button, styles.outlineText]}>{title}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  if (variant === 'ghost') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.ghostButton, disabled && styles.disabled, style]}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator color={colors.textSecondary} />
        ) : (
          <View style={styles.content}>
            {icon && <View style={styles.iconWrap}>{icon}</View>}
            <Text style={[typography.button, styles.ghostText]}>{title}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[disabled && styles.disabled, style]}
    >
      <LinearGradient
        colors={gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, shadows.button]}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <View style={styles.content}>
            {icon && <View style={styles.iconWrap}>{icon}</View>}
            <Text style={[typography.button, styles.primaryText]}>{title}</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  outlineButton: {
    paddingVertical: 16,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  ghostButton: {
    paddingVertical: 16,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    marginRight: spacing.sm,
  },
  primaryText: {
    color: colors.white,
  },
  outlineText: {
    color: colors.primary,
  },
  ghostText: {
    color: colors.textSecondary,
  },
  disabled: {
    opacity: 0.5,
  },
});

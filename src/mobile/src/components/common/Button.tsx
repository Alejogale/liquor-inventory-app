import React, { useCallback } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radius, shadows, layout } from '../../constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  haptic?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
  haptic = true,
}) => {
  const handlePress = useCallback(() => {
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  }, [onPress, haptic]);

  const sizeStyles = getSizeStyles(size);
  const variantStyles = getVariantStyles(variant, disabled);

  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.textPrimary : colors.primary}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <>{icon}</>
          )}
          <Text
            style={[
              styles.text,
              sizeStyles.text,
              variantStyles.text,
              icon ? (iconPosition === 'left' ? styles.textWithLeftIcon : styles.textWithRightIcon) : null,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <>{icon}</>
          )}
        </>
      )}
    </>
  );

  if (variant === 'primary' && !disabled) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[fullWidth && styles.fullWidth, style]}
      >
        <LinearGradient
          colors={colors.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.button,
            sizeStyles.button,
            shadows.glow,
            fullWidth && styles.fullWidth,
          ]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.button,
        sizeStyles.button,
        variantStyles.button,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const getSizeStyles = (size: ButtonSize) => {
  switch (size) {
    case 'sm':
      return {
        button: {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.base,
          minHeight: 36,
        } as ViewStyle,
        text: {
          fontSize: typography.size.sm,
        } as TextStyle,
      };
    case 'lg':
      return {
        button: {
          paddingVertical: spacing.lg,
          paddingHorizontal: spacing.xl,
          minHeight: 56,
        } as ViewStyle,
        text: {
          fontSize: typography.size.md,
        } as TextStyle,
      };
    default: // md
      return {
        button: {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          minHeight: layout.buttonHeight,
        } as ViewStyle,
        text: {
          fontSize: typography.size.base,
        } as TextStyle,
      };
  }
};

const getVariantStyles = (variant: ButtonVariant, disabled: boolean) => {
  const opacity = disabled ? 0.5 : 1;

  switch (variant) {
    case 'secondary':
      return {
        button: {
          backgroundColor: colors.surface,
          opacity,
        } as ViewStyle,
        text: {
          color: colors.textPrimary,
        } as TextStyle,
      };
    case 'outline':
      return {
        button: {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: colors.primary,
          opacity,
        } as ViewStyle,
        text: {
          color: colors.primary,
        } as TextStyle,
      };
    case 'ghost':
      return {
        button: {
          backgroundColor: 'transparent',
          opacity,
        } as ViewStyle,
        text: {
          color: colors.primary,
        } as TextStyle,
      };
    case 'danger':
      return {
        button: {
          backgroundColor: colors.error,
          opacity,
        } as ViewStyle,
        text: {
          color: colors.textPrimary,
        } as TextStyle,
      };
    default: // primary (when disabled)
      return {
        button: {
          backgroundColor: colors.primary,
          opacity,
        } as ViewStyle,
        text: {
          color: colors.textPrimary,
        } as TextStyle,
      };
  }
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.base,
  },
  text: {
    fontWeight: typography.weight.semibold,
    textAlign: 'center',
  },
  textWithLeftIcon: {
    marginLeft: spacing.sm,
  },
  textWithRightIcon: {
    marginRight: spacing.sm,
  },
  fullWidth: {
    width: '100%',
  },
});

export default Button;

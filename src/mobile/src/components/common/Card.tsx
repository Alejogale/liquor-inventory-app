import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius, shadows } from '../../constants/theme';

type CardVariant = 'default' | 'glass' | 'gradient' | 'elevated';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
  style?: ViewStyle;
  padding?: keyof typeof spacing;
  haptic?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  onPress,
  style,
  padding = 'base',
  haptic = true,
}) => {
  const handlePress = () => {
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  const cardContent = (
    <View style={[{ padding: spacing[padding] }]}>
      {children}
    </View>
  );

  if (variant === 'gradient') {
    const Wrapper = onPress ? TouchableOpacity : View;
    return (
      <Wrapper
        onPress={onPress ? handlePress : undefined}
        activeOpacity={onPress ? 0.8 : 1}
        style={style}
      >
        <LinearGradient
          colors={colors.gradientCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.card,
            styles.gradientCard,
            shadows.md,
          ]}
        >
          {cardContent}
        </LinearGradient>
      </Wrapper>
    );
  }

  const variantStyles = getVariantStyles(variant);

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        style={[
          styles.card,
          variantStyles,
          style,
        ]}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.card, variantStyles, style]}>
      {cardContent}
    </View>
  );
};

const getVariantStyles = (variant: CardVariant): ViewStyle => {
  switch (variant) {
    case 'glass':
      return {
        backgroundColor: colors.glass,
        borderWidth: 1,
        borderColor: colors.glassBorder,
      };
    case 'elevated':
      return {
        backgroundColor: colors.surface,
        ...shadows.lg,
      };
    default: // default
      return {
        backgroundColor: colors.surface,
      };
  }
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  gradientCard: {
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
});

export default Card;

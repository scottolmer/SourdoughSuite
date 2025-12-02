import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  size?: 'small' | 'medium' | 'large';
}

const Badge: React.FC<BadgeProps> = ({ 
  text, 
  variant = 'primary',
  size = 'medium' 
}) => {
  // Get background color based on variant
  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return '#D97706'; // amber-600
      case 'secondary':
        return '#6B7280'; // gray-500
      case 'success':
        return '#10B981'; // emerald-500
      case 'warning':
        return '#F59E0B'; // amber-500
      case 'danger':
        return '#EF4444'; // red-500
      case 'info':
        return '#3B82F6'; // blue-500
      default:
        return '#D97706'; // amber-600
    }
  };

  // Get text color based on variant
  const getTextColor = () => {
    // All variants have white text for good contrast
    return '#FFFFFF';
  };

  // Get size-based styles
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: 6,
          paddingVertical: 2,
          borderRadius: 4,
          fontSize: 10,
        };
      case 'large':
        return {
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 8,
          fontSize: 14,
        };
      case 'medium':
      default:
        return {
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 6,
          fontSize: 12,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: getBackgroundColor() },
        {
          paddingHorizontal: sizeStyles.paddingHorizontal,
          paddingVertical: sizeStyles.paddingVertical,
          borderRadius: sizeStyles.borderRadius,
        },
      ]}
    >
      <Text 
        style={[
          styles.text, 
          { color: getTextColor(), fontSize: sizeStyles.fontSize }
        ]}
      >
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: 'bold',
  },
});

export default Badge;
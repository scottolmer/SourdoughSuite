import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  iconName?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  iconName,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
}) => {
  // Get variant-specific styles
  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: disabled ? '#F3F4F6' : '#D97706', // gray-100 or amber-600
            borderWidth: 0,
          },
          text: {
            color: disabled ? '#9CA3AF' : '#FFFFFF', // gray-400 or white
          },
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: disabled ? '#F3F4F6' : '#6B7280', // gray-100 or gray-500
            borderWidth: 0,
          },
          text: {
            color: disabled ? '#9CA3AF' : '#FFFFFF', // gray-400 or white
          },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: disabled ? '#E5E7EB' : '#D97706', // gray-200 or amber-600
          },
          text: {
            color: disabled ? '#9CA3AF' : '#D97706', // gray-400 or amber-600
          },
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: disabled ? '#F3F4F6' : 'transparent', // gray-100 or transparent
            borderWidth: 0,
          },
          text: {
            color: disabled ? '#9CA3AF' : '#D97706', // gray-400 or amber-600
          },
        };
      case 'link':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 0,
            paddingHorizontal: 0,
            paddingVertical: 0,
          },
          text: {
            color: disabled ? '#9CA3AF' : '#D97706', // gray-400 or amber-600
            textDecorationLine: 'underline',
          },
        };
      case 'danger':
        return {
          container: {
            backgroundColor: disabled ? '#F3F4F6' : '#EF4444', // gray-100 or red-500
            borderWidth: 0,
          },
          text: {
            color: disabled ? '#9CA3AF' : '#FFFFFF', // gray-400 or white
          },
        };
      default:
        return {
          container: {
            backgroundColor: disabled ? '#F3F4F6' : '#D97706', // gray-100 or amber-600
            borderWidth: 0,
          },
          text: {
            color: disabled ? '#9CA3AF' : '#FFFFFF', // gray-400 or white
          },
        };
    }
  };

  // Get size-specific styles
  const getSizeStyles = (): { container: ViewStyle; text: TextStyle; icon: number } => {
    switch (size) {
      case 'small':
        return {
          container: {
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 4,
          },
          text: {
            fontSize: 12,
          },
          icon: 16,
        };
      case 'large':
        return {
          container: {
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 8,
          },
          text: {
            fontSize: 16,
          },
          icon: 24,
        };
      case 'medium':
      default:
        return {
          container: {
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 6,
          },
          text: {
            fontSize: 14,
          },
          icon: 20,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  // Render icon if provided
  const renderIcon = () => {
    if (!iconName) return null;

    const iconColor = variantStyles.text.color || '#FFFFFF';
    
    return (
      <Ionicons
        name={iconName}
        size={sizeStyles.icon}
        color={iconColor as string}
        style={
          iconPosition === 'left'
            ? { marginRight: 8 }
            : { marginLeft: 8 }
        }
      />
    );
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variantStyles.container,
        sizeStyles.container,
        fullWidth && styles.fullWidth,
        style,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyles.text.color as string}
        />
      ) : (
        <>
          {iconPosition === 'left' && renderIcon()}
          <Text
            style={[
              styles.text,
              variantStyles.text,
              sizeStyles.text,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {iconPosition === 'right' && renderIcon()}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.7,
  },
});

export default Button;
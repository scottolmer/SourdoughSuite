import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
  padding?: 'none' | 'small' | 'medium' | 'large';
  borderRadius?: number;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  elevation = 1,
  padding = 'medium',
  borderRadius = 8,
}) => {
  // Get shadow based on elevation
  const getShadowStyle = () => {
    switch (elevation) {
      case 0:
        return {};
      case 1:
        return {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        };
      case 2:
        return {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 2,
        };
      case 3:
        return {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
          elevation: 3,
        };
      case 4:
        return {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 5,
          elevation: 4,
        };
      case 5:
        return {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.25,
          shadowRadius: 6,
          elevation: 5,
        };
      default:
        return {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        };
    }
  };

  // Get padding based on size
  const getPaddingStyle = () => {
    switch (padding) {
      case 'none':
        return { padding: 0 };
      case 'small':
        return { padding: 8 };
      case 'large':
        return { padding: 16 };
      case 'medium':
      default:
        return { padding: 12 };
    }
  };

  return (
    <View
      style={[
        styles.card,
        getShadowStyle(),
        getPaddingStyle(),
        { borderRadius },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB', // gray-200
  },
});

export default Card;
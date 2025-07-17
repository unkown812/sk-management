import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
}

const sizeMap = {
  small: 'small' as 'small',
  medium: 'large' as 'large',
  large: 48,
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'medium' }) => {
  const indicatorSize = sizeMap[size] || 'large';

  return (
    <View style={styles.container}>
      <ActivityIndicator size={indicatorSize} color="#2563eb" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoadingSpinner;

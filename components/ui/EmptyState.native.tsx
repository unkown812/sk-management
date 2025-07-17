import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertCircle } from 'react-native-feather';

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon = <AlertCircle width={48} height={48} color="#9ca3af" />
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {icon}
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 16,
    textAlign: 'center',
  },
  iconContainer: {
    backgroundColor: '#f3f4f6', // gray-100
    borderRadius: 9999,
    padding: 12,
  },
  title: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827', // gray-900
    textAlign: 'center',
  },
  message: {
    marginTop: 4,
    fontSize: 14,
    color: '#6b7280', // gray-500
    textAlign: 'center',
  },
});

export default EmptyState;

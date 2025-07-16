import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactElement;
  color?: string; 
  bgcolor?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color = '#000', bgcolor = '#fff' }) => {
  return (
    <View style={[styles.card, { backgroundColor: bgcolor, borderColor: 'transparent' }]}>
      <View style={styles.row}>
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
          {icon}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={[styles.value, { color }]}>{value}</Text>
          {/* Placeholder for change indicator */}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    marginVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    padding: 12,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: 20,
  },
  title: {
    fontSize: 14,
    color: '#6b7280', // gray-500
    fontWeight: '500',
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
  },
});

export default StatCard;

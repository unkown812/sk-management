import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal } from 'react-native';

interface Student {
  id?: number;
  name: string;
  category: string;
  course: string;
  year: number | null;
  phone: string;
  paid_fee: number | null;
  total_fee: number | null;
  due_amount: number | null;
  last_payment: string;
}

interface FeeDueReminderProps {
  showFeeDueReminder: boolean;
  dueStudents: Student[];
  onDismiss: () => void;
  onSendWhatsAppMessages: () => void;
}

const FeeDueReminder: React.FC<FeeDueReminderProps> = ({
  showFeeDueReminder,
  dueStudents,
  onDismiss,
  onSendWhatsAppMessages,
}) => {
  if (!showFeeDueReminder) return null;

  const renderItem = ({ item }: { item: Student }) => (
    <Text style={styles.studentItem}>
      {item.name} - Due: ₹{item.due_amount} - Contact: {item.phone}
    </Text>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fee Due Reminder:</Text>
      <FlatList
        data={dueStudents}
        keyExtractor={(item) => item.id?.toString() || item.phone}
        renderItem={renderItem}
        style={styles.list}
      />
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={onSendWhatsAppMessages}>
          <Text style={styles.primaryButtonText}>Send WhatsApp Messages</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={onDismiss}>
          <Text style={styles.secondaryButtonText}>Dismiss</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fef3c7', // yellow-100
    borderColor: '#fbbf24', // yellow-400
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 50,
  },
  title: {
    fontWeight: 'bold',
    color: '#b45309', // yellow-700
    marginBottom: 8,
  },
  list: {
    maxHeight: 150,
    marginBottom: 12,
  },
  studentItem: {
    color: '#b45309', // yellow-700
    fontSize: 14,
    marginBottom: 4,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#2563eb', // blue-600
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#e5e7eb', // gray-200
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  secondaryButtonText: {
    color: '#374151', // gray-700
    fontWeight: '600',
  },
});

export default FeeDueReminder;

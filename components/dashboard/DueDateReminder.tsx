import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import supabase from '../../lib/supabase';

interface Student {
  id?: number;
  name: string;
  paid_fees?: number;
  due_amt?: number;
  enrolled?: boolean;
}

const DueDateReminder: React.FC = () => {
  const [dueStudents, setDueStudents] = useState<Student[]>([]);
  const [showReminder, setShowReminder] = useState(true);

  useEffect(() => {
    const fetchDueStudents = async () => {
      try {
        const todayDate = new Date();
        const dayOfMonth = todayDate.getDate();

        // Only show reminder on the first day of the month
        if (dayOfMonth !== 1) {
          setDueStudents([]);
          setShowReminder(false);
          return;
        }

        const { data, error } = await supabase
          .from('students')
          .select('id, name, paid_fees, due_amt, enrolled');

        if (error) {
          console.error('Error fetching students:', error);
          return;
        }

        if (data && data.length > 0) {
          // Filter students who are enrolled and have due fees
          const studentsDue = data.filter(student => {
            return student.enrolled && (student.paid_fees ?? 0) < (student.due_amt ?? 0);
          });

          if (studentsDue.length > 0) {
            setDueStudents(studentsDue);
            setShowReminder(true);

            Alert.alert(
              'Installment Reminder',
              `You have ${studentsDue.length} student(s) with installment due this month.`
            );
          } else {
            setDueStudents([]);
            setShowReminder(false);
          }
        } else {
          setDueStudents([]);
          setShowReminder(false);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      }
    };

    fetchDueStudents();
  }, []);

  if (!showReminder || dueStudents.length === 0) {
    return null;
  }

  return (
    <View style={styles.container} accessibilityRole="alert">
      <View style={styles.header}>
        <Text style={styles.title}>Installment Reminder!</Text>
        <TouchableOpacity
          onPress={() => setShowReminder(false)}
          accessibilityLabel="Close"
          style={styles.closeButton}
        >
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.message}>
        The following students have installment(s) due this month:
      </Text>
      <FlatList
        data={dueStudents}
        keyExtractor={(item) => item.id?.toString() || item.name}
        renderItem={({ item }) => (
          <Text style={styles.studentName}>
            • {item.name} - Due Amount: {item.due_amt} - Paid Fees: {item.paid_fees}
          </Text>
        )}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fefcbf', // yellow-100
    borderColor: '#f6e05e', // yellow-400
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#b7791f', // yellow-700
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  closeButtonText: {
    color: '#b7791f', // yellow-700
    fontSize: 24,
    lineHeight: 24,
  },
  message: {
    color: '#b7791f', // yellow-700
    marginTop: 8,
    fontSize: 14,
  },
  list: {
    marginTop: 8,
  },
  studentName: {
    color: '#b7791f', // yellow-700
    fontSize: 14,
    marginLeft: 8,
    marginBottom: 4,
  },
});

export default DueDateReminder;

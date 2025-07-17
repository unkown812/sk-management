import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import PushNotification from 'react-native-push-notification';
import supabase from '../../lib/supabase';

interface Student {
  id?: number;
  name: string;
  birthday: string; 
}

const BirthdayReminder: React.FC = () => {
  const [birthdayTodayStudents, setBirthdayTodayStudents] = useState<Student[]>([]);
  const [showReminder, setShowReminder] = useState(true);

  useEffect(() => {
    // Configure push notifications
    // PushNotification.configure({
    //   onNotification: function (notification) {
    //     console.log('NOTIFICATION:', notification);
    //   },
    //   requestPermissions: true,
    // });

    const fetchStudentsWithBirthdayToday = async () => {
      try {
        const today = new Date();
        const monthDay = today.toISOString().slice(5, 10);

        const { data, error } = await supabase
          .from('students')
          .select('id, name, birthday');

        if (error) {
          console.error('Error fetching students for birthday reminder:', error);
          return;
        }

        if (data && data.length > 0) {
          const birthdayStudents = data.filter(student => {
            if (!student.birthday) return false;
            return student.birthday.slice(5, 10) === monthDay;
          });

          if (birthdayStudents.length > 0) {
            setBirthdayTodayStudents(birthdayStudents);
            setShowReminder(true);

            // Show local notification
            // PushNotification.localNotification({
            //   title: 'Birthday Reminder',
            //   message: `You have ${birthdayStudents.length} student(s) with birthday today.`,
            // });
          } else {
            setBirthdayTodayStudents([]);
            setShowReminder(false);
          }
        } else {
          setBirthdayTodayStudents([]);
          setShowReminder(false);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      }
    };

    fetchStudentsWithBirthdayToday();
  }, []);

  if (!showReminder || birthdayTodayStudents.length === 0) {
    return null;
  }

  return (
    <View style={styles.container} accessibilityRole="alert">
      <View style={styles.header}>
        <Text style={styles.title}>Birthday Reminder!</Text>
        <TouchableOpacity
          onPress={() => setShowReminder(false)}
          accessibilityLabel="Close"
          style={styles.closeButton}
        >
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.message}>
        The following students have birthday today ({new Date().toLocaleDateString()}):
      </Text>
      <FlatList
        data={birthdayTodayStudents}
        keyExtractor={(item) => item.id?.toString() || item.name}
        renderItem={({ item }) => <Text style={styles.studentName}>• {item.name}</Text>}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ebf8ff', // blue-100
    borderColor: '#63b3ed', // blue-400
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
    color: '#2b6cb0', // blue-700
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  closeButtonText: {
    color: '#2b6cb0', // blue-700
    fontSize: 24,
    lineHeight: 24,
  },
  message: {
    color: '#2b6cb0', // blue-700
    marginTop: 8,
    fontSize: 14,
  },
  list: {
    marginTop: 8,
  },
  studentName: {
    color: '#2b6cb0', // blue-700
    fontSize: 14,
    marginLeft: 8,
    marginBottom: 4,
  },
});

export default BirthdayReminder;

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import supabase from '../../lib/supabase';
// You can replace this with a suitable React Native icon library
import { MaterialIcons } from '@expo/vector-icons';

interface Exam {
  id: number;
  name: string;
  date: string;
  course?: string;
  category?: string;
  year?: number;
}

const UpcomingExams: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [todayExam, setTodayExam] = useState<Exam | null>(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const { data, error } = await supabase
          .from('exams')
          .select('id, name, category, course, year, date');
        if (error) {
          console.error('Error fetching exams:', error);
          return;
        }
        const examsData = data || [];
        setExams(examsData);

        // Check for exam scheduled today
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const examToday = examsData.find((exam) => exam.date === todayStr) || null;
        setTodayExam(examToday);

        // React Native does not support browser Notification API
        // Use Alert as placeholder or integrate push notification library
        if (examToday) {
          Alert.alert('Exam Reminder', `You have an exam scheduled today: ${examToday.name}`);
        }
      } catch (err) {
        console.error('Unexpected error fetching exams:', err);
      }
    };

    fetchExams();
  }, []);

  return (
    <ScrollView style={styles.container}>
      {todayExam && (
        <View style={styles.reminder}>
          <Text style={styles.reminderText}>
            Reminder: You have an exam scheduled today: {todayExam.name}
          </Text>
        </View>
      )}
      {exams.map((exam) => (
        <TouchableOpacity key={exam.id} style={styles.examCard}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="calendar-today" size={24} color="#2563eb" />
            <Text style={styles.dateText}>
              {new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
          </View>
          <View style={styles.examInfo}>
            <Text style={styles.examName}>{exam.name}</Text>
            <View style={styles.tagsContainer}>
              {exam.course && <Text style={styles.courseTag}>{exam.course}</Text>}
              {exam.category && <Text style={styles.categoryTag}>{exam.category}</Text>}
              {exam.year !== undefined && <Text style={styles.yearTag}>{exam.year}th</Text>}
            </View>
          </View>
        </TouchableOpacity>
      ))}
      <View style={styles.viewAllContainer}>
        <TouchableOpacity onPress={() => { /* Placeholder for view all exams navigation */ }}>
          <Text style={styles.viewAllText}>View all exams →</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  reminder: {
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#fbbf24', // yellow-400
    backgroundColor: '#fef3c7', // yellow-50
    borderRadius: 8,
  },
  reminderText: {
    color: '#b45309', // yellow-800
    fontWeight: '600',
  },
  examCard: {
    flexDirection: 'row',
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db', // gray-300
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#eff6ff', // blue-100
  },
  iconContainer: {
    alignItems: 'center',
    marginRight: 12,
  },
  dateText: {
    marginTop: 4,
    fontSize: 12,
    color: '#2563eb', // blue-800
    fontWeight: '500',
  },
  examInfo: {
    flex: 1,
  },
  examName: {
    fontWeight: '600',
    fontSize: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    gap: 8,
  },
  courseTag: {
    color: '#2563eb', // blue-600
    marginRight: 8,
  },
  categoryTag: {
    color: '#15803d', // green-700
    marginRight: 8,
  },
  yearTag: {
    color: '#c2410c', // orange-600
  },
  viewAllContainer: {
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: '#3b82f6', // primary blue
    fontWeight: '600',
  },
});

export default UpcomingExams;

import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import Layout from '../components/layout/Layout';
import StatCard from '../components/dashboard/StatCard';
import RecentFeePayments from '../components/dashboard/RecentFeePayments';
// import AttendanceChart from '../components/dashboard/AttendanceChart';
// import PerformanceWidget from '../components/dashboard/PerformanceWidget';
import UpcomingExams from '../components/dashboard/UpcomingExams';
import { studentService } from '../services/studentService';
import supabase from '../lib/supabase';
import DueDateReminder from '../components/dashboard/DueDateReminder';
import BirthdayReminder from '../components/dashboard/BirthdayReminder';

const Dashboard: React.FC = () => {
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalFeesCollected, setTotalFeesCollected] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const students = await studentService.getAll();
        setTotalStudents(students.length);

        const { data: studentsData, error } = await supabase
          .from('students')
          .select('total_fee, paid_fee');

        if (error) throw error;

        if (studentsData && studentsData.length > 0) {
          const totalFeesCollected = studentsData.reduce((sum: number, student: any) => sum + (student.total_fee || 0), 0);
          setTotalFeesCollected(totalFeesCollected);
        } else {
          setTotalFeesCollected(0);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <Layout>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>
            Overview of SK Tutorials management system
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            title="Total Students"
            value={totalStudents}
            change={+1}
            // Replace icon prop with appropriate React Native icon or remove
            icon={null}
            color="#1E40AF" // text-blue-800
            bgcolor="#DBEAFE" // bg-blue-50
          />
          <StatCard
            title="Fee Collection"
            value={`₹${totalFeesCollected.toLocaleString()}`}
            change={+8.2}
            icon={null}
            color="#166534" // text-green-800
            bgcolor="#DCFCE7" // bg-green-50
          />
        </View>

        {/* Charts and tables section */}
        <View style={styles.chartsGrid}>
          {/* Uncomment and convert these components if needed */}
          {/* <View style={styles.card}>
            <Text style={styles.cardTitle}>Attendance Overview</Text>
            <AttendanceChart />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Performance Overview</Text>
            <PerformanceWidget />
          </View> */}
        </View>

        {/* Tables section */}
        <View style={styles.tablesGrid}>
          <View style={[styles.card, styles.overflowHidden]}>
            <Text style={styles.cardTitle}>Recent Fee Payments</Text>
            <RecentFeePayments />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Upcoming Exams</Text>
            <UpcomingExams />
          </View>
        </View>

        <View style={styles.singleCardGrid}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Due Date Reminders</Text>
            <DueDateReminder />
          </View>
        </View>

        <View style={styles.singleCardGrid}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Birthday Reminders</Text>
            <BirthdayReminder />
          </View>
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    // paddingVertical: 24,
    // paddingHorizontal: 16,
    padding: 10,
    backgroundColor: '#fff',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827', // text-gray-900
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#6B7280', // text-gray-500
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  chartsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  tablesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  singleCardGrid: {
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flex: 1,
    minWidth: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  overflowHidden: {
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 12,
  },
});

export default Dashboard;
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import { attendanceService } from '../../services/attendanceService';

interface Attendance {
  id: number;
  date: string;
  subject: string;
  status: string;
}

interface SubjectAttendance {
  subject: string;
  present: number;
  total: number;
  percentage: number;
}

interface StudentAttendanceProps {
  studentId: string;
}

const months = [
  'All', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const StudentAttendance: React.FC<StudentAttendanceProps> = ({ studentId }) => {
  const [selectedMonth, setSelectedMonth] = useState('May');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const data = await attendanceService.getByStudentId(studentId);
        setAttendance(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch attendance data');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [studentId]);

  const filteredAttendance = attendance.filter(
    item =>
      (selectedSubject === 'All' || item.subject === selectedSubject) &&
      (selectedMonth === 'All' || new Date(item.date).toLocaleString('default', { month: 'long' }) === selectedMonth)
  );

  const totalClasses = filteredAttendance.length;
  const presentClasses = filteredAttendance.filter(item => item.status.toLowerCase() === 'present').length;
  const absentClasses = totalClasses - presentClasses;
  const attendancePercentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;

  const subjects = ['All', ...Array.from(new Set(attendance.map(item => item.subject)))];

  const subjectWiseAttendance: SubjectAttendance[] = subjects.filter(s => s !== 'All').map(subject => {
    const subjectRecords = attendance.filter(item => item.subject === subject);
    const total = subjectRecords.length;
    const present = subjectRecords.filter(item => item.status.toLowerCase() === 'present').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    return { subject, present, total, percentage };
  });

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading attendance data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  const renderSummaryCard = (title: string, value: string | number, color: string) => (
    <View style={[styles.card, { backgroundColor: color }]}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  );

  const renderSubjectAttendance = ({ item }: { item: SubjectAttendance }) => {
    let barColor = '#dc2626'; // red-600
    if (item.percentage >= 75) barColor = '#16a34a'; // green-600
    else if (item.percentage >= 60) barColor = '#ca8a04'; // yellow-500

    return (
      <View style={styles.subjectAttendanceContainer}>
        <View style={styles.subjectAttendanceHeader}>
          <Text style={styles.subjectName}>{item.subject}</Text>
          <Text style={styles.subjectStats}>
            {item.present}/{item.total} classes ({item.percentage}%)
          </Text>
        </View>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${item.percentage}%`, backgroundColor: barColor }]} />
        </View>
      </View>
    );
  };

  const renderAttendanceDetail = ({ item }: { item: Attendance }) => (
    <View style={styles.attendanceRow}>
      <Text style={styles.attendanceCell}>{new Date(item.date).toLocaleDateString()}</Text>
      <Text style={styles.attendanceCell}>{item.subject}</Text>
      <View style={[styles.statusBadge, item.status.toLowerCase() === 'present' ? styles.presentBadge : styles.absentBadge]}>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Attendance summary */}
      <View style={styles.summaryContainer}>
        {renderSummaryCard('Attendance Rate', `${Math.round(attendancePercentage)}%`, '#dbeafe')}
        {renderSummaryCard('Present', presentClasses, '#dcfce7')}
        {renderSummaryCard('Absent', absentClasses, '#fee2e2')}
        <View style={[styles.card, { backgroundColor: '#fff' }]}>
          <Text style={styles.cardTitle}>Current Month</Text>
          <Text style={styles.cardValue}>{selectedMonth}</Text>
          <Text style={styles.cardSubtitle}>2025</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedMonth}
            onValueChange={(itemValue) => setSelectedMonth(itemValue)}
            mode="dropdown"
          >
            {months.map((month) => (
              <Picker.Item key={month} label={month} value={month} />
            ))}
          </Picker>
          <MaterialIcons name="calendar-today" size={20} color="#9ca3af" style={styles.pickerIcon} />
        </View>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedSubject}
            onValueChange={(itemValue) => setSelectedSubject(itemValue)}
            mode="dropdown"
          >
            {subjects.map((subject) => (
              <Picker.Item key={subject} label={subject} value={subject} />
            ))}
          </Picker>
          <MaterialIcons name="filter-list" size={20} color="#9ca3af" style={styles.pickerIcon} />
        </View>
      </View>

      {/* Subject-wise attendance */}
      <View style={styles.subjectAttendanceSection}>
        <Text style={styles.sectionTitle}>Subject-wise Attendance</Text>
        <FlatList
          data={subjectWiseAttendance}
          keyExtractor={(item) => item.subject}
          renderItem={renderSubjectAttendance}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>

      {/* Attendance details table */}
      <View style={styles.attendanceDetailsSection}>
        <Text style={styles.sectionTitle}>Attendance Details</Text>
        <View style={styles.attendanceTableHeader}>
          <Text style={[styles.attendanceCell, styles.headerCell]}>Date</Text>
          <Text style={[styles.attendanceCell, styles.headerCell]}>Subject</Text>
          <Text style={[styles.attendanceCell, styles.headerCell]}>Status</Text>
        </View>
        <FlatList
          data={filteredAttendance}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderAttendanceDetail}
          ListEmptyComponent={
            <Text style={styles.noRecordsText}>No attendance records found</Text>
          }
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  filtersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  pickerContainer: {
    flex: 1,
    marginHorizontal: 4,
    position: 'relative',
  },
  pickerIcon: {
    position: 'absolute',
    right: 8,
    top: 12,
  },
  subjectAttendanceSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  subjectAttendanceContainer: {
    marginBottom: 12,
  },
  subjectAttendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  subjectName: {
    fontWeight: '600',
    fontSize: 16,
  },
  subjectStats: {
    color: '#6b7280',
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 5,
    marginTop: 4,
  },
  progressBarFill: {
    height: 10,
    borderRadius: 5,
  },
  attendanceDetailsSection: {
    marginBottom: 32,
  },
  attendanceTableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    paddingBottom: 8,
  },
  attendanceCell: {
    flex: 1,
    fontSize: 14,
  },
  headerCell: {
    fontWeight: '600',
  },
  attendanceRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    alignItems: 'center',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  presentBadge: {
    backgroundColor: '#22c55e',
  },
  absentBadge: {
    backgroundColor: '#ef4444',
  },
  statusText: {
    color: '#fff',
    fontWeight: '600',
  },
  noRecordsText: {
    textAlign: 'center',
    color: '#6b7280',
    paddingVertical: 16,
  },
  separator: {
    height: 12,
  },
});

export default StudentAttendance;

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { attendanceService } from '../../services/attendanceService';

interface AttendanceData {
  name: string;
  value: number;
}

const AttendanceChart: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const data = await attendanceService.getAll();

        const attendanceMap: Record<string, { present: number; total: number }> = {};

        data.forEach((record: any) => {
          const key = record.subject || 'Unknown';
          if (!attendanceMap[key]) {
            attendanceMap[key] = { present: 0, total: 0 };
          }
          attendanceMap[key].total += 1;
          if (record.status.toLowerCase() === 'present') {
            attendanceMap[key].present += 1;
          }
        });

        const aggregatedData = Object.entries(attendanceMap).map(([name, counts]) => ({
          name,
          value: counts.total > 0 ? Math.round((counts.present / counts.total) * 100) : 0,
        }));

        setAttendanceData(aggregatedData);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch attendance data');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  if (loading) return <Text style={styles.message}>Loading attendance data...</Text>;
  if (error) return <Text style={styles.error}>Error: {error}</Text>;

  return (
    <ScrollView style={styles.container}>
      {attendanceData.map((item) => (
        <View key={item.name} style={styles.itemContainer}>
          <View style={styles.labelRow}>
            <Text style={styles.nameText}>{item.name}</Text>
            <Text style={styles.valueText}>{item.value}%</Text>
          </View>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${item.value}%` }]} />
          </View>
        </View>
      ))}
      <Text style={styles.lastUpdated}>Last updated: just now</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  message: {
    padding: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  error: {
    padding: 16,
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  itemContainer: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  nameText: {
    fontWeight: '600',
    fontSize: 14,
  },
  valueText: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressBarBackground: {
    width: '100%',
    height: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 5,
  },
  progressBarFill: {
    height: 10,
    backgroundColor: '#2563eb',
    borderRadius: 5,
  },
  lastUpdated: {
    paddingTop: 8,
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
  },
});

export default AttendanceChart;

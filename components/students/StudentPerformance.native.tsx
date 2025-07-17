import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { performanceService } from '../../services/performanceService';

interface Performance {
  id: number;
  exam_name: string;
  date: string;
  marks: number;
  total_marks: number;
  percentage: number;
}

interface StudentPerformanceProps {
  studentId: string;
}

const examTypes = ['All', 'Monthly Test', 'Quarterly Exam', 'Mock Test'];

const StudentPerformance: React.FC<StudentPerformanceProps> = ({ studentId }) => {
  const [selectedExamType, setSelectedExamType] = useState('All');
  const [performance, setPerformance] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        setLoading(true);
        const data: Performance[] = await performanceService.getByStudentId(studentId);
        setPerformance(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to fetch performance data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, [studentId]);

  const filteredPerformance = performance.filter(
    item => selectedExamType === 'All' || item.exam_name.includes(selectedExamType)
  );

  // Calculate average performance
  const avgPerformance = filteredPerformance.length > 0
    ? Math.round(filteredPerformance.reduce((sum, item) => sum + item.percentage, 0) / filteredPerformance.length)
    : 0;

  // Find highest and lowest performances
  const highestPerformance = filteredPerformance.length > 0
    ? Math.max(...filteredPerformance.map(item => item.percentage))
    : 0;

  const lowestPerformance = filteredPerformance.length > 0
    ? Math.min(...filteredPerformance.map(item => item.percentage))
    : 0;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading performance data...</Text>
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

  const renderSummaryCard = (title: string, value: string | number, icon: React.ReactNode, bgColor: string, iconBgColor: string, iconColor: string) => (
    <View style={[styles.card, { backgroundColor: bgColor }]}>
      <View style={styles.cardContent}>
        <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
          {icon}
        </View>
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardValue}>{value}</Text>
        </View>
      </View>
    </View>
  );

  const renderPerformanceBar = (item: Performance, index: number) => {
    let barColor = '#dc2626'; // red-600
    if (item.percentage >= 80) barColor = '#16a34a'; // green-600
    else if (item.percentage >= 60) barColor = '#ca8a04'; // yellow-500

    return (
      <View key={index} style={styles.barContainer}>
        <View style={[styles.bar, { height: item.percentage * 1.5, backgroundColor: barColor }]} />
        <Text style={styles.barLabel}>{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
        <Text style={styles.barValue}>{item.percentage}%</Text>
      </View>
    );
  };

  const renderPerformanceItem = ({ item }: { item: Performance }) => {
    let badgeColor = '#dc2626'; // red
    if (item.percentage >= 80) badgeColor = '#16a34a'; // green
    else if (item.percentage >= 60) badgeColor = '#ca8a04'; // yellow

    return (
      <View style={styles.performanceRow}>
        <Text style={[styles.performanceCell, styles.examName]}>{item.exam_name}</Text>
        <Text style={[styles.performanceCell, styles.date]}>{new Date(item.date).toLocaleDateString()}</Text>
        <Text style={[styles.performanceCell, styles.marks]}>{item.marks}</Text>
        <Text style={[styles.performanceCell, styles.totalMarks]}>{item.total_marks}</Text>
        <View style={[styles.performanceCell, styles.percentageCell]}>
          <Text style={[styles.badge, { backgroundColor: badgeColor }]}>{item.percentage}%</Text>
        </View>
      </View>
    );
  };

  const renderAnalysis = () => {
    let strengths = '';
    let improvements = '';
    let recommendations = [];

    if (avgPerformance >= 80) {
      strengths = 'Excellent overall performance. Consistently scoring high marks across subjects.';
      improvements = 'Could focus on achieving greater consistency across all exam types.';
      recommendations = [
        'Join advanced study groups for additional challenges',
        'Consider participating in competitive exams',
        'Regular mock tests to simulate exam conditions',
      ];
    } else if (avgPerformance >= 70) {
      strengths = 'Good grasp of core concepts. Strong performance in most subjects with occasional excellence.';
      improvements = 'Improvement needed in specific challenging areas. Consider more practice tests.';
      recommendations = [
        'Schedule additional practice sessions for weaker areas',
        'Consider participating in competitive exams',
        'Regular mock tests to simulate exam conditions',
      ];
    } else {
      strengths = 'Shows potential in specific exams. Can build on successful study techniques.';
      improvements = 'Needs significant work on core concepts and test preparation strategies.';
      recommendations = [
        'Attend remedial sessions and increase study hours',
        'Focus on foundational concepts before advancing',
        'Regular mock tests to simulate exam conditions',
      ];
    }

    return (
      <View style={styles.analysisContainer}>
        <Text style={styles.analysisTitle}>Performance Analysis</Text>

        <View style={styles.analysisSection}>
          <Text style={styles.analysisHeading}>Strengths</Text>
          <Text style={styles.analysisText}>{strengths}</Text>
        </View>

        <View style={styles.analysisSection}>
          <Text style={styles.analysisHeading}>Areas for Improvement</Text>
          <Text style={styles.analysisText}>{improvements}</Text>
        </View>

        <View style={styles.analysisSection}>
          <Text style={styles.analysisHeading}>Recommendations</Text>
          {recommendations.map((rec, idx) => (
            <Text key={idx} style={styles.analysisText}>• {rec}</Text>
          ))}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Performance summary */}
      <View style={styles.summaryContainer}>
        {renderSummaryCard(
          'Average Score',
          `${avgPerformance}%`,
          <MaterialIcons name="trending-up" size={24} color="#2563eb" />,
          '#dbeafe',
          '#bfdbfe',
          '#2563eb'
        )}
        {renderSummaryCard(
          'Highest Score',
          `${highestPerformance}%`,
          <FontAwesome5 name="award" size={24} color="#16a34a" />,
          '#dcfce7',
          '#bbf7d0',
          '#16a34a'
        )}
        {renderSummaryCard(
          'Lowest Score',
          `${lowestPerformance}%`,
          <MaterialIcons name="book" size={24} color="#dc2626" />,
          '#fee2e2',
          '#fecaca',
          '#dc2626'
        )}
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Performance Details</Text>
        <Picker
          selectedValue={selectedExamType}
          onValueChange={(itemValue) => setSelectedExamType(itemValue)}
          mode="dropdown"
          style={styles.picker}
        >
          {examTypes.map(type => (
            <Picker.Item key={type} label={type} value={type} />
          ))}
        </Picker>
      </View>

      {/* Performance chart */}
      <ScrollView horizontal contentContainerStyle={styles.chartContainer}>
        {performance.length > 0 ? (
          filteredPerformance.map((item, index) => renderPerformanceBar(item, index))
        ) : (
          <Text style={styles.noDataText}>No performance data available</Text>
        )}
      </ScrollView>

      {/* Performance details table */}
      <View style={styles.performanceTableHeader}>
        <Text style={[styles.performanceCell, styles.examName, styles.headerText]}>Exam Name</Text>
        <Text style={[styles.performanceCell, styles.date, styles.headerText]}>Date</Text>
        <Text style={[styles.performanceCell, styles.marks, styles.headerText]}>Marks</Text>
        <Text style={[styles.performanceCell, styles.totalMarks, styles.headerText]}>Total</Text>
        <Text style={[styles.performanceCell, styles.percentageCell, styles.headerText]}>Percentage</Text>
      </View>

      <FlatList
        data={filteredPerformance}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPerformanceItem}
        ListEmptyComponent={<Text style={styles.noRecordsText}>No performance records found</Text>}
      />

      {/* Analysis and recommendations */}
      {renderAnalysis()}
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
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    padding: 8,
    borderRadius: 9999,
    marginRight: 12,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  picker: {
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
  },
  chartContainer: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  barContainer: {
    width: 40,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  bar: {
    width: 24,
    borderRadius: 4,
  },
  barLabel: {
    marginTop: 4,
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
  },
  barValue: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  performanceTableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    paddingBottom: 8,
  },
  performanceRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    alignItems: 'center',
  },
  performanceCell: {
    flex: 1,
    fontSize: 14,
  },
  examName: {
    flex: 2,
  },
  date: {
    flex: 1,
  },
  marks: {
    flex: 1,
  },
  totalMarks: {
    flex: 1,
  },
  percentageCell: {
    flex: 1,
  },
  badge: {
    color: '#fff',
    fontWeight: '600',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    textAlign: 'center',
  },
  noDataText: {
    textAlign: 'center',
    color: '#6b7280',
    paddingVertical: 16,
  },
  noRecordsText: {
    textAlign: 'center',
    color: '#6b7280',
    paddingVertical: 16,
  },
  headerText: {
    fontWeight: '600',
  },
  analysisContainer: {
    marginTop: 24,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  analysisSection: {
    marginBottom: 16,
  },
  analysisHeading: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  analysisText: {
    fontSize: 14,
    color: '#374151',
  },
});

export default StudentPerformance;
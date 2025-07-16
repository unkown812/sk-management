import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView } from 'react-native';
import supabase from '../../lib/supabase';

interface PerformanceData {
  exam_name: string;
  result_id: number;
}

interface ExamResult {
  id: number;
  exam_name: string;
  student_name: string;
  score: number;
  // Add other fields as needed
}

const PerformanceWidget: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [selectedExam, setSelectedExam] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        const { data, error } = await supabase
          .from('performance')
          .select('exam_name,result_id');

        if (error) {
          console.error('Error fetching performance data:', error);
          return;
        }

        if (data) {
          const mappedData = data.map((item: any) => ({
            exam_name: item.exam_name,
            result_id: item.result_id,
          }));
          setPerformanceData(mappedData);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      }
    };

    fetchPerformanceData();
  }, []);

  const fetchExamResults = async (examName: string) => {
    try {
      const { data, error } = await supabase
        .from('exam_results')
        .select('*')
        .eq('exam_name', examName);

      if (error) {
        console.error('Error fetching exam results:', error);
        return;
      }

      if (data) {
        setExamResults(data);
        setSelectedExam(examName);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  const renderItem = ({ item }: { item: PerformanceData }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity onPress={() => fetchExamResults(item.exam_name)}>
        <Text style={styles.itemText}>{item.exam_name}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderExamResult = ({ item }: { item: ExamResult }) => (
    <View style={styles.resultItem}>
      <Text style={styles.resultText}>
        Student: {item.student_name} - Score: {item.score}
      </Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <FlatList
        data={performanceData}
        keyExtractor={(item) => item.result_id.toString()}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
      {selectedExam && (
        <View style={styles.examResultsContainer}>
          <Text style={styles.examResultsTitle}>Results for {selectedExam}:</Text>
          <FlatList
            data={examResults}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderExamResult}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      )}
      <TouchableOpacity style={styles.button} onPress={() => { /* Placeholder for detailed report navigation */ }}>
        <Text style={styles.buttonText}>View detailed report →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  itemContainer: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb', // gray-200
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  itemText: {
    fontWeight: '500',
    fontSize: 16,
  },
  separator: {
    height: 12,
  },
  examResultsContainer: {
    marginTop: 16,
  },
  examResultsTitle: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 8,
  },
  resultItem: {
    padding: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 6,
  },
  resultText: {
    fontSize: 14,
  },
  button: {
    marginTop: 8,
  },
  buttonText: {
    fontSize: 14,
    color: '#3b82f6', // primary blue
    fontWeight: '500',
  },
});

export default PerformanceWidget;

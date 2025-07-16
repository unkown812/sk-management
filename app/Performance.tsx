import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  Alert,
} from 'react-native';
import supabase from '../lib/supabase';

interface Student {
  id: number;
  name: string;
  category: string;
  course: string;
  year: number;
}

interface Performance {
  id: number;
  result_id: number;
  exam_name: string;
  student_category: string;
  student_name: string;
  date: string;
  marks: number;
  total_marks: number;
  percentage: number;
}

interface Exam {
  id: number;
  name: string;
  date: string;
  category: string;
  course: string;
  year: number;
  subject: string;
  marks: number;
}

const categories = ['All', 'School (8-10th)', 'Junior College (11-12th)', 'Diploma', 'JEE', 'NEET', 'MHCET'];

const Performance: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [students, setStudents] = useState<Student[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // States for adding exam schedule
  const [showAddExamModal, setShowAddExamModal] = useState<boolean>(false);
  const [scheduleExamName, setScheduleExamName] = useState<string>('');
  const [scheduleDate, setScheduleDate] = useState<string>('');
  const [scheduleCategory, setScheduleCategory] = useState<string>('');
  const [scheduleCourse, setScheduleCourse] = useState<string>('');
  const [scheduleYear, setScheduleYear] = useState<string>('');
  const [scheduleSubject, setScheduleSubject] = useState<string>('');
  const [scheduleMarks, setScheduleMarks] = useState<string>('');
  const [scheduleFormError, setScheduleFormError] = useState<string | null>(null);
  const [scheduleSaving, setScheduleSaving] = useState<boolean>(false);

  // States for adding exam result
  const [showAddResultModal, setShowAddResultModal] = useState<boolean>(false);
  const [resultExamName, setResultExamName] = useState<string>('');
  const [resultTotalMarks, setResultTotalMarks] = useState<string>('');
  const [resultCategoryFilter, setResultCategoryFilter] = useState<string>('All');
  const [resultCourseFilter, setResultCourseFilter] = useState<string>('All');
  const [resultYearFilter, setResultYearFilter] = useState<string>('All');
  const [resultStudentMarks, setResultStudentMarks] = useState<{ [studentId: number]: string }>({});
  const [resultFormError, setResultFormError] = useState<string | null>(null);
  const [resultSaving, setResultSaving] = useState<boolean>(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: studentsData, error: studentsError } = await supabase.from('students').select('*');
      if (studentsError) throw studentsError;
      setStudents(studentsData || []);

      const { data: examsData, error: examsError } = await supabase.from('exams').select('*');
      if (examsError) throw examsError;
      setExams(examsData || []);

      const { data: performanceData, error: performanceError } = await supabase.from('performance').select('*');
      if (performanceError) throw performanceError;
      setPerformances(performanceData || []);
    } catch (err: any) {
      setError(err.message || 'Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExamSchedule = async () => {
    setScheduleFormError(null);
    if (!scheduleExamName || !scheduleDate || !scheduleCategory || !scheduleCourse || !scheduleYear || !scheduleSubject || !scheduleMarks) {
      setScheduleFormError('Please fill all fields');
      return;
    }
    setScheduleSaving(true);
    try {
      const { error } = await supabase.from('exams').insert([{
        name: scheduleExamName,
        date: scheduleDate,
        category: scheduleCategory,
        course: scheduleCourse,
        year: Number(scheduleYear),
        subject: scheduleSubject,
        marks: Number(scheduleMarks),
      }]);
      if (error) throw error;
      setShowAddExamModal(false);
      setScheduleExamName('');
      setScheduleDate('');
      setScheduleCategory('');
      setScheduleCourse('');
      setScheduleYear('');
      setScheduleSubject('');
      setScheduleMarks('');
      fetchData();
    } catch (err: any) {
      setScheduleFormError(err.message || 'Error saving exam schedule');
    } finally {
      setScheduleSaving(false);
    }
  };

  const handleAddExamResult = async () => {
    setResultFormError(null);
    if (!resultExamName || !resultTotalMarks) {
      setResultFormError('Please fill exam name and total marks');
      return;
    }
    const totalMarksNum = Number(resultTotalMarks);
    if (isNaN(totalMarksNum) || totalMarksNum <= 0) {
      setResultFormError('Invalid total marks');
      return;
    }
    const filteredStudents = students.filter(student => {
      if (resultCategoryFilter !== 'All' && student.category !== resultCategoryFilter) return false;
      if (resultCourseFilter !== 'All' && student.course !== resultCourseFilter) return false;
      if (resultYearFilter !== 'All' && student.year.toString() !== resultYearFilter) return false;
      return true;
    });
    if (filteredStudents.length === 0) {
      setResultFormError('No students found for selected filters');
      return;
    }
    for (const student of filteredStudents) {
      const marksStr = resultStudentMarks[student.id];
      if (marksStr === undefined || marksStr === '') {
        setResultFormError(`Please enter marks for student ${student.name}`);
        return;
      }
      const marksNum = Number(marksStr);
      if (isNaN(marksNum) || marksNum < 0 || marksNum > totalMarksNum) {
        setResultFormError(`Invalid marks for student ${student.name}`);
        return;
      }
    }
    setResultSaving(true);
    try {
      const insertData = filteredStudents.map(student => {
        const marksNum = Number(resultStudentMarks[student.id]);
        const percentage = (marksNum / totalMarksNum) * 100;
        return {
          exam_name: resultExamName,
          date: new Date().toISOString().split('T')[0],
          marks: marksNum,
          total_marks: totalMarksNum,
          percentage,
          student_name: student.name,
          student_category: student.category,
        };
      });
      const { error } = await supabase.from('performance').insert(insertData);
      if (error) throw error;
      setShowAddResultModal(false);
      setResultExamName('');
      setResultTotalMarks('');
      setResultCategoryFilter('All');
      setResultCourseFilter('All');
      setResultYearFilter('All');
      setResultStudentMarks({});
      fetchData();
    } catch (err: any) {
      setResultFormError(err.message || 'Error saving exam results');
    } finally {
      setResultSaving(false);
    }
  };

  const filteredExams = useMemo(() => {
    return exams.filter(exam => {
      if (selectedCategory !== 'All' && exam.category !== selectedCategory) return false;
      if (searchTerm && !exam.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [exams, searchTerm, selectedCategory]);

  const filteredPerformances = useMemo(() => {
    return performances.filter(perf => {
      if (selectedCategory !== 'All' && perf.student_category !== selectedCategory) return false;
      if (searchTerm && !perf.student_name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [performances, searchTerm, selectedCategory]);

  type GroupedPerformances = {
    [examName: string]: {
      [categoryCourseYear: string]: Performance[];
    };
  };

  const groupedPerformances: GroupedPerformances = {};

  filteredPerformances.forEach(perf => {
    if (!groupedPerformances[perf.exam_name]) {
      groupedPerformances[perf.exam_name] = {};
    }
    const key = `${perf.student_category}||${perf.student_name}`;
    if (!groupedPerformances[perf.exam_name][key]) {
      groupedPerformances[perf.exam_name][key] = [];
    }
    groupedPerformances[perf.exam_name][key].push(perf);
  });

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (examName: string, category: string) => {
    const groupKey = `${examName}||${category}`;
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Loading performance data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error loading data: {error}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Performance Tracking</Text>
        <Text style={styles.subtitle}>Monitor student academic performance and progress</Text>
      </View>

      <View style={styles.buttonsRow}>
        <TouchableOpacity style={styles.btnPrimary} onPress={() => setShowAddResultModal(true)}>
          <Text style={styles.btnPrimaryText}>Add New Exam Result</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSecondary} onPress={() => setShowAddExamModal(true)}>
          <Text style={styles.btnSecondaryText}>Schedule Exam</Text>
        </TouchableOpacity>
      </View>

      {/* Add Exam Schedule Modal */}
      <Modal visible={showAddExamModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Schedule New Exam</Text>
            {scheduleFormError ? <Text style={styles.errorText}>{scheduleFormError}</Text> : null}
            <TextInput
              style={styles.inputField}
              placeholder="Exam Name"
              value={scheduleExamName}
              onChangeText={setScheduleExamName}
            />
            <TextInput
              style={styles.inputField}
              placeholder="Date (YYYY-MM-DD)"
              value={scheduleDate}
              onChangeText={setScheduleDate}
            />
            <TextInput
              style={styles.inputField}
              placeholder="Category"
              value={scheduleCategory}
              onChangeText={setScheduleCategory}
            />
            <TextInput
              style={styles.inputField}
              placeholder="Course"
              value={scheduleCourse}
              onChangeText={setScheduleCourse}
            />
            <TextInput
              style={styles.inputField}
              placeholder="Year"
              value={scheduleYear}
              onChangeText={setScheduleYear}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.inputField}
              placeholder="Subject"
              value={scheduleSubject}
              onChangeText={setScheduleSubject}
            />
            <TextInput
              style={styles.inputField}
              placeholder="Total Marks"
              value={scheduleMarks}
              onChangeText={setScheduleMarks}
              keyboardType="numeric"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.btnSecondary}
                onPress={() => setShowAddExamModal(false)}
                disabled={scheduleSaving}
              >
                <Text style={styles.btnSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={handleAddExamSchedule}
                disabled={scheduleSaving}
              >
                <Text style={styles.btnPrimaryText}>{scheduleSaving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Exam Result Modal */}
      <Modal visible={showAddResultModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Exam Result</Text>
            {resultFormError ? <Text style={styles.errorText}>{resultFormError}</Text> : null}
            <TextInput
              style={styles.inputField}
              placeholder="Exam Name"
              value={resultExamName}
              onChangeText={setResultExamName}
            />
            <TextInput
              style={styles.inputField}
              placeholder="Total Marks"
              value={resultTotalMarks}
              onChangeText={setResultTotalMarks}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.inputField}
              placeholder="Category Filter"
              value={resultCategoryFilter}
              onChangeText={setResultCategoryFilter}
            />
            <TextInput
              style={styles.inputField}
              placeholder="Course Filter"
              value={resultCourseFilter}
              onChangeText={setResultCourseFilter}
            />
            <TextInput
              style={styles.inputField}
              placeholder="Year Filter"
              value={resultYearFilter}
              onChangeText={setResultYearFilter}
            />
            <ScrollView style={styles.studentMarksContainer}>
              {students
                .filter(student => {
                  if (resultCategoryFilter !== 'All' && student.category !== resultCategoryFilter) return false;
                  if (resultCourseFilter !== 'All' && student.course !== resultCourseFilter) return false;
                  if (resultYearFilter !== 'All' && student.year.toString() !== resultYearFilter) return false;
                  return true;
                })
                .map(student => (
                  <View key={student.id} style={styles.studentMarkRow}>
                    <Text style={styles.studentName}>
                      {student.name} ({student.category} - {student.course} - {student.year})
                    </Text>
                    <TextInput
                      style={styles.marksInput}
                      placeholder="Marks"
                      keyboardType="numeric"
                      value={resultStudentMarks[student.id] || ''}
                      onChangeText={text =>
                        setResultStudentMarks(prev => ({ ...prev, [student.id]: text }))
                      }
                    />
                  </View>
                ))}
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.btnSecondary}
                onPress={() => setShowAddResultModal(false)}
                disabled={resultSaving}
              >
                <Text style={styles.btnSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={handleAddExamResult}
                disabled={resultSaving}
              >
                <Text style={styles.btnPrimaryText}>{resultSaving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Exams List */}
      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>Scheduled Exams</Text>
        {filteredExams.length === 0 ? (
          <Text style={styles.noDataText}>No exams scheduled</Text>
        ) : (
          <FlatList
            data={filteredExams}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <Text style={styles.listItemText}>{item.name}</Text>
                <Text style={styles.listItemText}>{item.date}</Text>
                <Text style={styles.listItemText}>{item.category}</Text>
                <Text style={styles.listItemText}>{item.course}</Text>
                <Text style={styles.listItemText}>{item.year}</Text>
                <Text style={styles.listItemText}>{item.subject}</Text>
                <Text style={styles.listItemText}>{item.marks}</Text>
              </View>
            )}
          />
        )}
      </View>

      {/* Performance List */}
      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>Student Performance</Text>
        {Object.keys(groupedPerformances).length === 0 ? (
          <Text style={styles.noDataText}>No performance records found</Text>
        ) : (
          Object.entries(groupedPerformances).map(([examName, categoryGroups]) => (
            <View key={examName} style={styles.performanceGroup}>
              <TouchableOpacity onPress={() => toggleGroup(examName, examName)}>
                <Text style={styles.groupTitle}>{examName}</Text>
              </TouchableOpacity>
              {Object.entries(categoryGroups).map(([categoryCourseYear, perfs]) => {
                const [category] = categoryCourseYear.split('||');
                const groupKey = `${examName}||${category}`;
                const isExpanded = expandedGroups.has(groupKey);
                return (
                  <View key={categoryCourseYear}>
                    <TouchableOpacity onPress={() => toggleGroup(examName, category)}>
                      <Text style={styles.groupSubtitle}>{category}</Text>
                    </TouchableOpacity>
                    {isExpanded &&
                      perfs.map(perf => (
                        <View key={perf.id} style={styles.performanceItem}>
                          <Text style={styles.performanceText}>{perf.student_name}</Text>
                          <Text style={styles.performanceText}>{perf.student_category}</Text>
                          <Text style={styles.performanceText}>{perf.exam_name}</Text>
                          <Text style={styles.performanceText}>{perf.date}</Text>
                          <Text style={styles.performanceText}>{perf.marks}</Text>
                          <Text style={styles.performanceText}>{perf.total_marks}</Text>
                          <Text style={styles.performanceText}>{perf.percentage.toFixed(2)}%</Text>
                        </View>
                      ))}
                  </View>
                );
              })}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  btnPrimary: {
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '600',
  },
  btnSecondary: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  btnSecondaryText: {
    color: '#374151',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  inputField: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  studentMarksContainer: {
    maxHeight: 200,
    marginBottom: 12,
  },
  studentMarkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  studentName: {
    flex: 1,
    fontSize: 14,
  },
  marksInput: {
    width: 60,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
  },
  listSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  noDataText: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 12,
  },
  listItem: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  listItemText: {
    width: '14%',
    fontSize: 14,
  },
  performanceGroup: {
    marginBottom: 16,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '700',
    backgroundColor: '#E5E7EB',
    padding: 8,
  },
  groupSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    backgroundColor: '#F3F4F6',
    padding: 6,
    paddingLeft: 12,
  },
  performanceItem: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 6,
    paddingLeft: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  performanceText: {
    width: '14%',
    fontSize: 14,
  },
});

export default Performance;

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Switch,
  Alert,
} from 'react-native';
// Icons from lucide-react are not compatible with React Native.
// You can replace these with react-native-vector-icons or other icon libraries.
import TabNav from '../components/ui/TabNav';
import supabase from '../lib/supabase';

interface Student {
  id: number;
  name: string;
  category: string;
  course: string;
  year: number;
  email: string;
}

interface AttendanceRecord {
  student_id: number;
  date: string;
  status: string;
}

const studentCategories = [
  'School',
  'Junior College',
  'Diploma',
  'Entrance Exams',
];

const schoolCourses = ['SSC', 'CBSE', 'ICSE', 'Others'];

const juniorCollegeCourses = ['Science', 'Commerce', 'Arts'];

const diplomaCourses = ['Computer Science', 'Mechanical', 'Electrical', 'Civil'];

const entranceExamCourses = ['NEET', 'JEE', 'MHTCET', 'Boards'];

const feeStatuses = ['Paid', 'Partial', 'Unpaid'];

const AttendancePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [studentCourses, setStudentCourses] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>('mark');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [attendanceMap, setAttendanceMap] = useState<Record<number, Record<number, string>>>({});
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return now.toISOString().slice(0, 7); // YYYY-MM
  });
  const [daysInMonth, setDaysInMonth] = useState<number>(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate());

  useEffect(() => {
    switch (selectedCategory) {
      case 'School':
        setStudentCourses(schoolCourses);
        break;
      case 'Junior College':
        setStudentCourses(juniorCollegeCourses);
        break;
      case 'Diploma':
        setStudentCourses(diplomaCourses);
        break;
      case 'Entrance Exams':
        setStudentCourses(entranceExamCourses);
        break;
      default:
        setStudentCourses([]);
    }
    setSelectedCourse('All');
    setSelectedYear(0);
  }, [selectedCategory]);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: studentsData, error: studentsError } = await supabase.from('students').select('*');
        if (studentsError) throw studentsError;
        setStudents(studentsData || []);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError('Unknown error');
      }
      setLoading(false);
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      setError(null);
      try {
        const startDate = selectedMonth + '-01';
        const endDate = new Date(new Date(selectedMonth + '-01').getFullYear(), new Date(selectedMonth + '-01').getMonth() + 1, 0);
        setDaysInMonth(endDate.getDate());

        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance')
          .select('*')
          .gte('date', startDate)
          .lte('date', endDate.toISOString().slice(0, 10));

        if (attendanceError) throw attendanceError;

        // Map attendance by student_id and day
        const map: Record<number, Record<number, string>> = {};
        attendanceData?.forEach((record: AttendanceRecord) => {
          const day = new Date(record.date).getDate();
          if (!map[record.student_id]) map[record.student_id] = {};
          map[record.student_id][day] = record.status;
        });
        setAttendanceMap(map);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError('Unknown error');
      }
      setLoading(false);
    };
    fetchAttendance();
  }, [selectedMonth]);

  const filteredStudents = useMemo(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return students.filter(student => {
      const matchesSearch =
        student.name.toLowerCase().includes(lowerSearchTerm) ||
        (student.id && student.id.toString().includes(lowerSearchTerm)) ||
        student.email.toLowerCase().includes(lowerSearchTerm);

      const matchesCategory =
        selectedCategory === 'All' || student.category === selectedCategory;

      const matchesCourse =
        selectedCourse === 'All' || student.course === selectedCourse;

      const matchesYear =
        selectedYear === 0 || student.year === selectedYear;

      return matchesSearch && matchesCategory && matchesCourse && matchesYear;
    });
  }, [students, searchTerm, selectedCategory, selectedCourse, selectedYear]);

  const groupedStudents = useMemo(() => {
    const groups: Record<string, Record<string, Record<string, Student[]>>> = {};
    filteredStudents.forEach(student => {
      if (!groups[student.category]) groups[student.category] = {};
      if (!groups[student.category][student.course]) groups[student.category][student.course] = {};
      if (!groups[student.category][student.course][student.year]) groups[student.category][student.course][student.year] = [];
      groups[student.category][student.course][student.year].push(student);
    });
    return groups;
  }, [filteredStudents]);

  const handleStatusChange = (studentId: number, day: number, status: string) => {
    setAttendanceMap(prev => {
      const newMap = { ...prev };
      if (!newMap[studentId]) newMap[studentId] = {};
      newMap[studentId][day] = status;
      return newMap;
    });
  };

  // Sorting handlers
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const sortedGroupedStudents = useMemo(() => {
    if (!sortConfig) return groupedStudents;

    const sortedGroups: Record<string, Record<string, Record<string, Student[]>>> = {};

    // Sort categories
    const categories = Object.keys(groupedStudents).sort((a, b) => {
      if (sortConfig.key === 'category') {
        return sortConfig.direction === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
      }
      return 0;
    });

    categories.forEach(category => {
      sortedGroups[category] = {};
      const courses = Object.keys(groupedStudents[category]).sort((a, b) => {
        if (sortConfig.key === 'course') {
          return sortConfig.direction === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
        }
        return 0;
      });
      courses.forEach(course => {
        sortedGroups[category][course] = {};
        const years = Object.keys(groupedStudents[category][course]).sort((a, b) => {
          if (sortConfig.key === 'year') {
            return sortConfig.direction === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
          }
          return 0;
        });
        years.forEach(year => {
          let studentsList = groupedStudents[category][course][year];
          if (sortConfig.key === 'name') {
            studentsList = [...studentsList].sort((a, b) => {
              return sortConfig.direction === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
            });
          }
          sortedGroups[category][course][year] = studentsList;
        });
      });
    });

    return sortedGroups;
  }, [groupedStudents, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSaveAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      const recordsToInsert: AttendanceRecord[] = [];
      Object.entries(attendanceMap).forEach(([studentIdStr, days]) => {
        const studentId = parseInt(studentIdStr);
        Object.entries(days).forEach(([dayStr, status]) => {
          const day = parseInt(dayStr);
          const date = new Date(selectedMonth + '-01');
          date.setDate(day);
          recordsToInsert.push({
            student_id: studentId,
            date: date.toISOString().slice(0, 10),
            status,
          });
        });
      });

      const { error: upsertError } = await supabase.from('attendance').upsert(recordsToInsert);
      if (upsertError) throw upsertError;
      Alert.alert('Success', 'Attendance saved successfully.');
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Unknown error');
      Alert.alert('Error', 'Failed to save attendance');
    }
    setLoading(false);
  };

  const tabs = [
    { id: 'mark', label: 'Mark Attendance' },
    { id: 'summary', label: 'Summary' },
  ];

  // Prepare summary data grouped by category
  const summaryData = useMemo(() => {
    const summaryGroups: Record<string, { studentCount: number; presentCount: number }> = {};
    students.forEach(student => {
      if (selectedCategory !== 'All' && student.category !== selectedCategory) return;
      if (!summaryGroups[student.category]) {
        summaryGroups[student.category] = { studentCount: 0, presentCount: 0 };
      }
      summaryGroups[student.category].studentCount += 1;
      const attendanceDays = attendanceMap[student.id] || {};
      const presentDays = Object.values(attendanceDays).filter(status => status === 'Present').length;
      summaryGroups[student.category].presentCount += presentDays;
    });
    return summaryGroups;
  }, [students, attendanceMap, selectedCategory]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Derive unique categories, courses, and years from students for filter dropdowns
  const categories = ['All', ...studentCategories];
  const courses = ['All', ...studentCourses];
  const years = ['All', 1, 2, 3, 4];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Attendance</Text>
        <TabNav tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      </View>

      <View style={styles.filtersRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, id, email, course, category, or year"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        {activeTab === 'mark' && (
          <TouchableOpacity
            style={styles.btnPrimary}
            disabled={loading}
            onPress={handleSaveAttendance}
          >
            <Text style={styles.btnPrimaryText}>Save Attendance</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filtersRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.filterButton,
                selectedCategory === cat && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedCategory === cat && styles.filterButtonTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.filtersRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {courses.map(course => (
            <TouchableOpacity
              key={course}
              style={[
                styles.filterButton,
                selectedCourse === course && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedCourse(course)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedCourse === course && styles.filterButtonTextActive,
                ]}
              >
                {course}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.filtersRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {years.map(year => (
            <TouchableOpacity
              key={year}
              style={[
                styles.filterButton,
                selectedYear === (year === 'All' ? 0 : year) && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedYear(year === 'All' ? 0 : Number(year))}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedYear === (year === 'All' ? 0 : year) && styles.filterButtonTextActive,
                ]}
              >
                {year}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {activeTab === 'summary' && (
        <ScrollView style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Monthly Attendance Summary - {selectedMonth}</Text>
          {Object.entries(summaryData).length === 0 ? (
            <Text style={styles.noDataText}>No data available</Text>
          ) : (
            Object.entries(summaryData).map(([category, data]) => {
              const totalPossibleDays = data.studentCount * daysInMonth;
              const averageAttendance =
                totalPossibleDays > 0
                  ? ((data.presentCount / totalPossibleDays) * 100).toFixed(2)
                  : '0.00';
              return (
                <View key={category} style={styles.summaryRow}>
                  <Text style={styles.summaryCategory}>{category}</Text>
                  <Text style={styles.summaryValue}>Total Students: {data.studentCount}</Text>
                  <Text style={styles.summaryValue}>Total Present Days: {data.presentCount}</Text>
                  <Text style={styles.summaryValue}>Average Attendance: {averageAttendance}%</Text>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {activeTab === 'mark' && (
        <ScrollView horizontal style={styles.attendanceTableContainer}>
          <View>
            <View style={styles.attendanceTableHeader}>
              <Text style={[styles.cell, styles.headerCell]}>Category</Text>
              <Text style={[styles.cell, styles.headerCell]}>Course</Text>
              <Text style={[styles.cell, styles.headerCell]}>Year</Text>
              <Text style={[styles.cell, styles.headerCell]}>Name</Text>
              {[...Array(daysInMonth)].map((_, i) => (
                <Text key={i} style={[styles.cell, styles.headerCell, styles.dayCell]}>
                  {i + 1}
                </Text>
              ))}
            </View>

            <FlatList
              data={Object.entries(sortedGroupedStudents).flatMap(([category, courses]) =>
                Object.entries(courses).flatMap(([course, years]) =>
                  Object.entries(years).flatMap(([year, studentsList]) =>
                    studentsList.map(student => ({
                      category,
                      course,
                      year,
                      student,
                    }))
                  )
                )
              )}
              keyExtractor={item => item.student.id.toString()}
              renderItem={({ item }) => {
                const { category, course, year, student } = item;
                return (
                  <View style={styles.attendanceTableRow}>
                    <Text style={styles.cell}>{category}</Text>
                    <Text style={styles.cell}>{course}</Text>
                    <Text style={styles.cell}>{year}</Text>
                    <Text style={styles.cell}>{student.name}</Text>
                    {[...Array(daysInMonth)].map((_, dayIndex) => {
                      const day = dayIndex + 1;
                      const status = attendanceMap[student.id]?.[day] || 'Absent';
                      const isPresent = status === 'Present';
                      return (
                        <Switch
                          key={day}
                          value={isPresent}
                          onValueChange={value =>
                            handleStatusChange(student.id, day, value ? 'Present' : 'Absent')
                          }
                        />
                      );
                    })}
                  </View>
                );
              }}
              ListEmptyComponent={
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>No students found</Text>
                </View>
              }
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    marginRight: 8,
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
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterButtonText: {
    color: '#374151',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  summaryContainer: {
    marginTop: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  summaryRow: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  summaryCategory: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
  },
  noDataText: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 20,
  },
  noDataContainer: {
    padding: 20,
  },
  attendanceTableContainer: {
    marginTop: 16,
  },
  attendanceTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  attendanceTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cell: {
    minWidth: 60,
    paddingHorizontal: 4,
    fontSize: 12,
  },
  headerCell: {
    fontWeight: '700',
    fontSize: 12,
  },
  dayCell: {
    minWidth: 24,
    textAlign: 'center',
  },
});

export default AttendancePage;

import React, { useState, useEffect } from 'react';
import { PlusCircle, Search, Filter, Download, X } from 'lucide-react';
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
  const [scheduleYear, setScheduleYear] = useState<number | ''>('');
  const [scheduleSubject, setScheduleSubject] = useState<string>('');
  const [scheduleMarks, setScheduleMarks] = useState<number | ''>('');
  const [scheduleFormError, setScheduleFormError] = useState<string | null>(null);
  const [scheduleSaving, setScheduleSaving] = useState<boolean>(false);

  // States for adding exam result
  const [showAddResultModal, setShowAddResultModal] = useState<boolean>(false);
  // Remove old single exam and student states
  // const [resultExamId, setResultExamId] = useState<string>('');
  // const [resultStudentId, setResultStudentId] = useState<string>('');
  // const [resultMarks, setResultMarks] = useState<string>('');
  const [resultFormError, setResultFormError] = useState<string | null>(null);
  const [resultSaving, setResultSaving] = useState<boolean>(false);

  // New states for redesigned Add Exam Result modal
  const [resultExamName, setResultExamName] = useState<string>('');
  const [resultTotalMarks, setResultTotalMarks] = useState<string>('');
  const [resultCategoryFilter, setResultCategoryFilter] = useState<string>('All');
  const [resultCourseFilter, setResultCourseFilter] = useState<string>('All');
  const [resultYearFilter, setResultYearFilter] = useState<string>('All');
  const [resultStudentMarks, setResultStudentMarks] = useState<{ [studentId: number]: string }>({});

  // Categories for filters
  const categories = ['All', 'School (8-10th)', 'Junior College (11-12th)', 'Diploma', 'JEE', 'NEET', 'MHCET'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*');
      if (studentsError) throw studentsError;
      setStudents(studentsData || []);

      // Fetch exams
      const { data: examsData, error: examsError } = await supabase
        .from('exams')
        .select('*');
      if (examsError) throw examsError;
      setExams(examsData || []);

      // Fetch performances
      const { data: performanceData, error: performanceError } = await supabase
        .from('performance')
        .select('*');
      if (performanceError) throw performanceError;
      setPerformances(performanceData || []);
    } catch (err: any) {
      setError(err.message || 'Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle adding exam schedule
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
        year: scheduleYear,
        subject: scheduleSubject,
        marks: scheduleMarks,
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

  // Function to handle adding exam result
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
    // Filter students based on selected filters
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
    // Validate marks for each student
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
      // Prepare insert data for each student
      const insertData = filteredStudents.map(student => {
        const marksNum = Number(resultStudentMarks[student.id]);
        const percentage = (marksNum / totalMarksNum) * 100;
        return {
          exam_name: resultExamName,
          date: new Date().toISOString().split('T')[0], // Use current date
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
      // Clear form
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

  // Filtered exams and performances based on search and category
  const filteredExams = exams.filter(exam => {
    if (selectedCategory !== 'All' && exam.category !== selectedCategory) return false;
    if (searchTerm && !exam.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const filteredPerformances = performances.filter(perf => {
    if (selectedCategory !== 'All' && perf.student_category !== selectedCategory) return false;
    if (searchTerm && !perf.student_name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // Group performances by exam_name, then by category, course, year
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
    const key = `${perf.student_category}||${perf.student_name}`; // Using student_name here since course and year are not in performance
    if (!groupedPerformances[perf.exam_name][key]) {
      groupedPerformances[perf.exam_name][key] = [];
    }
    groupedPerformances[perf.exam_name][key].push(perf);
  });

  // State to track expanded exam/category groups
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(new Set());

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
    return <div>Loading performance data...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error loading data: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Performance Tracking</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor student academic performance and progress
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-4">
          <button className="btn-primary flex items-center" onClick={() => setShowAddResultModal(true)}>
            <PlusCircle className="h-5 w-5 mr-2" />
            Add New Exam Result
          </button>
          <button
            className="btn-secondary flex items-center"
            onClick={() => setShowAddExamModal(true)}
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Schedule Exam
          </button>
        </div>
      </div>

      {/* Add Exam Schedule Modal */}
      {showAddExamModal && (
        <div className="modal">
          <div className="modal-content">
            <h2 className="text-xl font-semibold mb-4">Schedule New Exam</h2>
            {scheduleFormError && <p className="text-red-500 mb-2">{scheduleFormError}</p>}
            <input
              type="text"
              placeholder="Exam Name"
              value={scheduleExamName}
              onChange={(e) => setScheduleExamName(e.target.value)}
              className="input-field mb-2"
            />
            <input
              type="date"
              placeholder="Date"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="input-field mb-2"
            />
            <input
              type="text"
              placeholder="Category"
              value={scheduleCategory}
              onChange={(e) => setScheduleCategory(e.target.value)}
              className="input-field mb-2"
            />
            <input
              type="text"
              placeholder="Course"
              value={scheduleCourse}
              onChange={(e) => setScheduleCourse(e.target.value)}
              className="input-field mb-2"
            />
            <input
              type="number"
              placeholder="Year"
              value={scheduleYear}
              onChange={(e) => setScheduleYear(Number(e.target.value))}
              className="input-field mb-2"
            />
            <input
              type="text"
              placeholder="Subject"
              value={scheduleSubject}
              onChange={(e) => setScheduleSubject(e.target.value)}
              className="input-field mb-2"
            />
            <input
              type="number"
              placeholder="Total Marks"
              value={scheduleMarks}
              onChange={(e) => setScheduleMarks(Number(e.target.value))}
              className="input-field mb-4"
            />
            <div className="flex justify-end space-x-4">
              <button
                className="btn-secondary"
                onClick={() => setShowAddExamModal(false)}
                disabled={scheduleSaving}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleAddExamSchedule}
                disabled={scheduleSaving}
              >
                {scheduleSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Exam Result Modal */}
      {showAddResultModal && (
        <div className="modal">
          <div className="modal-content">
            <h2 className="text-xl font-semibold mb-4">Add Exam Result</h2>
            {resultFormError && <p className="text-red-500 mb-2">{resultFormError}</p>}
            <input
              type="text"
              placeholder="Exam Name"
              value={resultExamName}
              onChange={(e) => setResultExamName(e.target.value)}
              className="input-field mb-2"
            />
            <input
              type="number"
              placeholder="Total Marks"
              value={resultTotalMarks}
              onChange={(e) => setResultTotalMarks(e.target.value)}
              className="input-field mb-2"
            />
            <select
              value={resultCategoryFilter}
              onChange={(e) => setResultCategoryFilter(e.target.value)}
              className="input-field mb-2"
            >
              <option value="All">All Categories</option>
              {[...new Set(students.map(s => s.category))].map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={resultCourseFilter}
              onChange={(e) => setResultCourseFilter(e.target.value)}
              className="input-field mb-2"
            >
              <option value="All">All Courses</option>
              {[...new Set(students.map(s => s.course))].map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
            <select
              value={resultYearFilter}
              onChange={(e) => setResultYearFilter(e.target.value)}
              className="input-field mb-4"
            >
              <option value="All">All Years</option>
              {[...new Set(students.map(s => s.year.toString()))].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <div className="max-h-64 overflow-y-auto mb-4">
              {students.filter(student => {
                if (resultCategoryFilter !== 'All' && student.category !== resultCategoryFilter) return false;
                if (resultCourseFilter !== 'All' && student.course !== resultCourseFilter) return false;
                if (resultYearFilter !== 'All' && student.year.toString() !== resultYearFilter) return false;
                return true;
              }).map(student => (
                <div key={student.id} className="flex items-center space-x-4 mb-2">
                  <div className="flex-1">{student.name} ({student.category} - {student.course} - {student.year})</div>
                  <input
                    type="number"
                    placeholder="Marks"
                    value={resultStudentMarks[student.id] || ''}
                    onChange={(e) => setResultStudentMarks(prev => ({ ...prev, [student.id]: e.target.value }))}
                    className="input-field w-24"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-4">
              <button
                className="btn-secondary"
                onClick={() => setShowAddResultModal(false)}
                disabled={resultSaving}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleAddExamResult}
                disabled={resultSaving}
              >
                {resultSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exams Table */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Scheduled Exams</h2>
        <div className="table-container mb-6">
          <table className="data-table">
            <thead>
              <tr>
                <th>Exam Name</th>
                <th>Date</th>
                <th>Category</th>
                <th>Course</th>
                <th>Year</th>
                <th>Subject</th>
                <th>Total Marks</th>
              </tr>
            </thead>
            <tbody>
              {filteredExams.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">
                    No exams scheduled
                  </td>
                </tr>
              ) : (
                filteredExams.map(exam => (
                  <tr key={exam.id}>
                    <td>{exam.name}</td>
                    <td>{exam.date}</td>
                    <td>{exam.category}</td>
                    <td>{exam.course}</td>
                    <td>{exam.year}</td>
                    <td>{exam.subject}</td>
                    <td>{exam.marks}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Table */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Student Performance</h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Category</th>
                <th>Exam Name</th>
                <th>Date</th>
                <th>Marks</th>
                <th>Total Marks</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {filteredPerformances.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">
                    No performance records found
                  </td>
                </tr>
              ) : (
                Object.entries(groupedPerformances).map(([examName, categoryGroups]) => (
                  <React.Fragment key={examName}>
                    {Object.entries(categoryGroups).map(([categoryCourseYear, perfs]) => {
                      const [category, studentName] = categoryCourseYear.split('||');
                      const groupKey = `${examName}||${category}`;
                      const isExpanded = expandedGroups.has(groupKey);
                      return (
                        <React.Fragment key={categoryCourseYear}>
                          <tr className="bg-gray-100 italic cursor-pointer" onClick={() => toggleGroup(examName, category)}>
                            <td colSpan={7}>Exam: {examName} Category: {category} </td>
                          </tr>
                          {isExpanded && perfs.map(perf => (
                            <tr key={perf.id}>
                              <td>{perf.student_name}</td>
                              <td>{perf.student_category}</td>
                              <td>{perf.exam_name}</td>
                              <td>{perf.date}</td>
                              <td>{perf.marks}</td>
                              <td>{perf.total_marks}</td>
                              <td>{perf.percentage.toFixed(2)}%</td>
                            </tr>
                          ))}
                        </React.Fragment>
                      );
                    })}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Performance;
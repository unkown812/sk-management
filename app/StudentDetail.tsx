import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Edit, Trash2, CreditCard, TrendingUp, CalendarCheck
} from 'lucide-react';
import TabNav from '../components/ui/TabNav';
import supabase from '../lib/supabase';

const StudentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [student, setStudent] = useState<Record<string, any> | null>(null);
  const [editStudent, setEditStudent] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [enrollmentYearStart, setEnrollmentYearStart] = useState<number | ''>('');
  const [enrollmentYearEnd, setEnrollmentYearEnd] = useState<number | ''>('');
  const [installmentAmt, setInstallmentAmt] = useState<number[]>([]);

  useEffect(() => {
    const fetchStudent = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        setError(error.message);
        setStudent(null);
      } else {
        setStudent(data);
        setEditStudent(data);
        if (data && data.enrollment_year && Array.isArray(data.enrollment_year)) {
          setEnrollmentYearStart(data.enrollment_year[0] || '');
          setEnrollmentYearEnd(data.enrollment_year[1] || '');
        }
      }
      setLoading(false);
    };
    if (id) {
      fetchStudent();
    }
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setDataLoading(true);
      setDataError(null);
      setDataLoading(false);
    };
    fetchData();
  }, [id]);

  const handleEditClick = () => {
    setShowEditModal(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'installments') {
      const installmentsNum = Number(value);
      if (installmentsNum < 1 || installmentsNum > 24) {
        return;
      }
      let newInstallmentAmt: number[] = [];
      if (editStudent && editStudent.total_fee && installmentsNum > 0) {
        const amt = (editStudent.total_fee as number) / installmentsNum;
        newInstallmentAmt = Array(installmentsNum).fill(amt);
      }
      setInstallmentAmt(newInstallmentAmt);
      setEditStudent((prev) => (prev ? { ...prev, [name]: installmentsNum } : prev));
    } else if (name === 'total_fee') {
      const totalFeeNum = Number(value);
      let installmentsNum = editStudent?.installments ?? 1;
      if (installmentsNum < 1) installmentsNum = 1;
      if (installmentsNum > 24) installmentsNum = 24;
      const amt = installmentsNum > 0 ? totalFeeNum / installmentsNum : 0;
      const newInstallmentAmt = Array(installmentsNum).fill(amt);
      setInstallmentAmt(newInstallmentAmt);
      setEditStudent((prev) => (prev ? { ...prev, total_fee: totalFeeNum } : prev));
    } else {
      setEditStudent((prev) => (prev ? { ...prev, [name]: value } : prev));
    }
  };

  const handleEnrollmentYearStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === '' ? '' : Number(e.target.value);
    setEnrollmentYearStart(val);
  };

  const handleEnrollmentYearEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === '' ? '' : Number(e.target.value);
    setEnrollmentYearEnd(val);
  };

  const handleSave = async () => {
    setSaving(true);
    const updatedStudent = {
      ...editStudent,
      enrollment_year: [enrollmentYearStart, enrollmentYearEnd],
      installment_amt: installmentAmt,
    };
    const { error } = await supabase
      .from('students')
      .update(updatedStudent)
      .eq('id', id);
    if (error) {
      setError(error.message);
    } else {
      setStudent(updatedStudent);
      setShowEditModal(false);
    }
    setSaving(false);
  };
  if (loading) {
    return <div>Loading student details...</div>;
  }
  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-xl font-medium text-gray-600">Student not found</p>
        <Link to="/students" className="mt-4 text-primary hover:underline">
          Back to Students
        </Link>
      </div>
    );
  }

  if (dataLoading) {
    return <div>Loading student related data...</div>;
  }

  if (dataError) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-xl font-medium text-red-600">{dataError}</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    // { id: 'fees', label: 'Fee History' },
    // { id: 'attendance', label: 'Attendance' },
    // { id: 'performance', label: 'Performance' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/students" className="mr-4 text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">{student.name}</h1>
          <span className="ml-4 badge badge-blue">{student.category}</span>
        </div>
        <div className="flex space-x-3">
          <button onClick={handleEditClick} className="btn-secondary flex items-center">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </button>
          <button
            aria-label="Delete student"
            onClick={async () => {
              if (window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
                try {
                  setLoading(true);
                  const { error } = await supabase
                    .from('students')
                    .delete()
                    .eq('id', id);
                  if (error) {
                    setError(error.message);
                    setLoading(false);
                    return;
                  }
                  window.location.href = '/students';
                } catch {
                  setError('Failed to delete student.');
                  setLoading(false);
                }
              }
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-md"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Edit Student Modal */}
      {showEditModal && (
        <div className="fixed inset-0 scrollbar-hide bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit Student Details</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowEditModal(false)}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            {error && <div className="mb-4 text-red-600 font-medium">{error}</div>}
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={editStudent.name || ''}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                  required
                />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                <input
                  type="text"
                  name="category"
                  id="category"
                  value={editStudent.category || ''}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label htmlFor="course" className="block text-sm font-medium text-gray-700">Course</label>
                <input
                  type="text"
                  name="course"
                  id="course"
                  value={editStudent.course || ''}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700">Year</label>
                <input
                  type="number"
                  name="year"
                  id="year"
                  value={editStudent.year || ''}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                  min={1}
                  max={10}
                />
              </div>
              <div>
                <label htmlFor="semester" className="block text-sm font-medium text-gray-700">Semester</label>
                <input
                  type="number"
                  name="semester"
                  id="semester"
                  value={editStudent.semester || ''}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                  min={1}
                  max={10}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={editStudent.email || ''}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={editStudent.phone || ''}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label htmlFor="enrollmentYearStart" className="block text-sm font-medium text-gray-700">Enrollment Year Start</label>
                <input
                  type="number"
                  name="enrollmentYearStart"
                  id="enrollmentYearStart"
                  value={enrollmentYearStart}
                  onChange={handleEnrollmentYearStartChange}
                  className="input-field mt-1"
                  min={1900}
                  max={2100}
                />
              </div>
              <div>
                <label htmlFor="enrollmentYearEnd" className="block text-sm font-medium text-gray-700">Enrollment Year End</label>
                <input
                  type="number"
                  name="enrollmentYearEnd"
                  id="enrollmentYearEnd"
                  value={enrollmentYearEnd}
                  onChange={handleEnrollmentYearEndChange}
                  className="input-field mt-1"
                  min={1900}
                  max={2100}
                />
              </div>
              <div>
                <label htmlFor="total_fee" className="block text-sm font-medium text-gray-700">Total Fee</label>
                <input
                  type="number"
                  name="total_fee"
                  id="total_fee"
                  value={editStudent.total_fee || ''}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                  min={0}
                />
              </div>
              <div>
                <label htmlFor="installments" className="block text-sm font-medium text-gray-700">Installments</label>
                <input
                  type="number"
                  name="installments"
                  id="installments"
                  value={editStudent.installments || ''}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                  min={1}
                  max={24}
                />
              </div>
              <div>
                <label htmlFor="fee_status" className="block text-sm font-medium text-gray-700">Fee Status</label>
                <input
                  type="text"
                  name="fee_status"
                  id="fee_status"
                  value={editStudent.fee_status || ''}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label htmlFor="subjects_enrolled" className="block text-sm font-medium text-gray-700">Subjects Enrolled</label>
                <input
                  type="text"
                  name="subjects_enrolled"
                  id="subjects_enrolled"
                  value={Array.isArray(editStudent.subjects_enrolled) ? editStudent.subjects_enrolled.join(', ') : ''}
                  onChange={(e) => {
                    const subjects = e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0);
                    setEditStudent(prev => ({ ...prev, subjects_enrolled: subjects }));
                  }}
                  placeholder="Enter subjects separated by commas"
                  className="input-field mt-1"
                />
              </div>
              {editStudent.installments && editStudent.installments > 0 && (
                <div className="mt-4">
                  <h3 className="text-md font-semibold mb-2">Installment Due Dates</h3>
                  {[...Array(editStudent.installments)].map((_, index) => (
                    <div key={index} className="mb-2">
                      <label htmlFor={`installment_date_${index}`} className="block text-sm font-medium text-gray-700">
                        Installment {index + 1} Due Date
                      </label>
                      <input
                        type="date"
                        id={`installment_date_${index}`}
                        value={editStudent.installment_dates && editStudent.installment_dates[index] ? editStudent.installment_dates[index] : ''}
                        onChange={(e) => {
                          const newDates = editStudent?.installment_dates ? [...editStudent.installment_dates] : [];
                          newDates[index] = e.target.value;
                          setEditStudent(prev => (prev ? { ...prev, installment_dates: newDates } : prev));
                        }}
                        className="input-field mt-1"
                        required
                      />
                    </div>
                  ))}
                  {[...Array(editStudent.installments)].map((_, index) => (
                    <div key={index} className="mb-2">
                      <label htmlFor={`installment_amt_${index}`} className="block text-sm font-medium text-gray-700">
                        Installment {index + 1} amount
                      </label>
                      <input
                        type="number"
                        id={`installment_amt_${index}`}
                        value={editStudent.installment_amt && editStudent.installment_amt[index] ? editStudent.installment_amt[index] : ''}
                        onChange={(e) => {
                          const newAmts = editStudent?.installment_amt ? [...editStudent.installment_amt] : [];
                          newAmts[index] = Number(e.target.value);
                          setEditStudent(prev => (prev ? { ...prev, installment_amt: newAmts } : prev));
                        }}
                        className="input-field mt-1"
                        required
                      />
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-6 flex justify-end space-x-4">
                <button className="btn-secondary" onClick={() => setShowEditModal(false)} disabled={saving}>Cancel</button>
                <button className="btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <TabNav tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="bg-white shadow rounded-lg p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Recent Activities</h3>
              <div className="border rounded-lg divide-y">
                <div className="p-4 flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <CalendarCheck className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">Attended Physics Class</p>
                    <p className="text-sm text-gray-500">May 10, 2025 • 10:30 AM</p>
                  </div>
                </div>
                <div className="p-4 flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-green-700" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">Scored 92% in Monthly Test</p>
                    <p className="text-sm text-gray-500">May 8, 2025 • Chemistry</p>
                  </div>
                </div>
                <div className="p-4 flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-orange-700" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">Fee Payment - ₹5,000</p>
                    <p className="text-sm text-gray-500">May 5, 2025 • Second Installment</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* {activeTab === 'fees' && <StudentFeeHistory studentId={student.id} />} */}
        {/* {activeTab === 'attendance' && <StudentAttendance studentId={student.id} />} */}
        {/* {activeTab === 'performance' && <StudentPerformance studentId={student.id} />} */}
      </div>
    </div>
  );
};

export default StudentDetail;

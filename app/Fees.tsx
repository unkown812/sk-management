import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Feather';
import supabase from '../lib/supabase';

interface Student {
  id?: number;
  name: string;
  category: string;
  course: string;
  year: number;
  email: string;
  phone: string;
  enrollment_date: string;
  fee_status: string;
  total_fee: number;
  paid_fee: number;
  due_amount: number;
  installment_amt: number;
  installments: number;
}

interface FeeSummary {
  id: number;
  name: string;
  category: string;
  course: string;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  payment_date: string;
  payment_method: string;
  status: 'Paid' | 'Partial' | 'Unpaid';
  description: string;
}

const Fees: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [feeSummary, setFeeSummary] = useState<FeeSummary[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [showTable, setShowTable] = useState<boolean>(true);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [feeStatus, setFeeStatus] = useState<string>('Unpaid');
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [paymentDetails, setPaymentDetails] = useState<string>('');
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [payments, setPayments] = useState<FeeSummary[]>([]);

  useEffect(() => {
    fetchData();
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase.from('payments').select('*');
      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: studentsData, error: studentsError } = await supabase.from('students').select('*');
      if (studentsError) throw studentsError;
      setStudents(studentsData || []);
      const summary = (studentsData || []).map((student: Student) => {
        const totalAmount = student.total_fee || 0;
        const amountPaid = student.paid_fee || 0;
        const amountDue = totalAmount - amountPaid;

        let actualStatus: 'Paid' | 'Partial' | 'Unpaid';
        if (amountDue <= 0 && totalAmount > 0) {
          actualStatus = 'Paid';
        } else if (amountPaid > 0) {
          actualStatus = 'Partial';
        } else {
          actualStatus = 'Unpaid';
        }

        return {
          id: student.id!,
          name: student.name,
          category: student.category,
          course: student.course,
          totalAmount: totalAmount,
          amountPaid: amountPaid,
          amountDue: amountDue,
          status: actualStatus,
          payment_date: '',
          payment_method: '',
          description: '',
        };
      });
      setFeeSummary(summary);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error fetching data');
      }
    }
    setLoading(false);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSubmitError(null);
    setPaymentAmount('');
    setPaymentDetails('');
    setSelectedStudentId(null);
    setPaymentMethod('cash');
    setPaymentDate(new Date());
  };

  const handlePaymentSubmit = async () => {
    setSubmitError(null);
    if (!selectedStudentId) {
      setSubmitError('Please select a student.');
      return;
    }
    const amountNum = parseFloat(paymentAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setSubmitError('Please enter a valid payment amount.');
      return;
    }
    if (!paymentDate) {
      setSubmitError('Please select a payment date.');
      return;
    }
    if (!paymentMethod) {
      setSubmitError('Please select a payment method.');
      return;
    }
    setSubmitLoading(true);
    try {
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('paid_fee, last_payment, name')
        .eq('id', selectedStudentId)
        .single();
      if (studentError) throw studentError;
      const newPaidFee = (studentData?.paid_fee || 0) + amountNum;
      const { error: updateError } = await supabase
        .from('students')
        .update({
          paid_fee: newPaidFee,
          last_payment: paymentDate.toISOString().split('T')[0],
        })
        .eq('id', selectedStudentId);
      if (updateError) throw updateError;
      const { error: insertError } = await supabase
        .from('payments')
        .insert([
          {
            student_id: selectedStudentId,
            student_name: studentData?.name,
            amount: amountNum,
            payment_date: paymentDate.toISOString().split('T')[0],
            payment_method: paymentMethod,
            description: paymentDetails,
            status: feeStatus,
          },
        ]);
      if (insertError) throw insertError;
      await fetchData();
      setFeeSummary((prevFeeSummary) => {
        return prevFeeSummary.map((fee) => {
          if (fee.id === selectedStudentId) {
            const newAmountPaid = fee.amountPaid + amountNum;
            const newAmountDue = fee.totalAmount - newAmountPaid;
            let newStatus: 'Paid' | 'Partial' | 'Unpaid';
            if (newAmountDue === 0 && fee.totalAmount > 0) {
              newStatus = 'Paid';
            } else if (newAmountPaid > 0) {
              newStatus = 'Partial';
            } else {
              newStatus = 'Unpaid';
            }
            return {
              ...fee,
              amountPaid: newAmountPaid,
              amountDue: newAmountDue,
              status: newStatus,
            };
          }
          return fee;
        });
      });
      closePaymentModal();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError('Error recording payment');
      }
    }
    setSubmitLoading(false);
  };

  const filteredFeeSummary = feeSummary.filter((fee) => {
    const matchesSearch =
      fee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.id.toString().includes(searchTerm) ||
      fee.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || fee.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalFees = filteredFeeSummary.reduce((sum, fee) => sum + fee.totalAmount, 0);
  const totalCollected = filteredFeeSummary.reduce((sum, fee) => sum + fee.amountPaid, 0);
  const totalPending = filteredFeeSummary.reduce((sum, fee) => sum + fee.amountDue, 0);

  const renderFeeItem = ({ item }: { item: FeeSummary }) => (
    <TouchableOpacity
      style={styles.feeRow}
      onPress={() => {
        if (item.amountDue > 0) {
          setSelectedStudentId(item.id);
          setPaymentAmount('');
          setPaymentDate(new Date());
          setSubmitError(null);
          setShowPaymentModal(true);
        }
      }}
    >
      <Text style={styles.feeCellName}>{item.name}</Text>
      <Text style={styles.feeCellCategory}>{item.category}</Text>
      <Text style={styles.feeCell}>₹{item.totalAmount.toLocaleString()}</Text>
      <Text style={[styles.feeCell, styles.paid]}>{`₹${item.amountPaid.toLocaleString()}`}</Text>
      <Text style={[styles.feeCell, styles.due]}>{`₹${item.amountDue.toLocaleString()}`}</Text>
      <Text
        style={[
          styles.feeCellStatus,
          item.status === 'Paid'
            ? styles.statusPaid
            : item.status === 'Partial'
            ? styles.statusPartial
            : styles.statusUnpaid,
        ]}
      >
        {item.status}
      </Text>
      <TouchableOpacity
        onPress={() => {
          if (item.amountDue > 0) {
            setSelectedStudentId(item.id);
            setPaymentAmount('');
            setPaymentDate(new Date());
            setSubmitError(null);
            setShowPaymentModal(true);
          }
        }}
      >
        <Text style={styles.updateButton}>{item.amountDue > 0 ? 'Update' : ' - '}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderPaymentItem = ({ item }: { item: FeeSummary }) => (
    <View style={styles.paymentRow}>
      <Text style={styles.paymentCellName}>{item.student_name}</Text>
      <Text style={styles.paymentCell}>{item.payment_date}</Text>
      <Text style={styles.paymentCell}>{item.payment_method}</Text>
      <Text style={styles.paymentCell}>₹{item.amount.toLocaleString()}</Text>
      <Text style={styles.paymentCellDescription}>{item.description}</Text>
    </View>
  );

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setPaymentDate(selectedDate);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Fee Management</Text>
          <Text style={styles.subtitle}>Track and manage fee payments for all students</Text>
        </View>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setShowTable(!showTable)}
        >
          <Text style={styles.toggleButtonText}>{showTable ? 'Close' : 'Update Fee'}</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {error && <Text style={styles.errorText}>Error: {error}</Text>}

      <Modal
        visible={showPaymentModal}
        transparent
        animationType="fade"
        onRequestClose={closePaymentModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Record New Payment</Text>

            <ScrollView>
              <Text style={styles.label}>Student</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedStudentId ?? ''}
                  onValueChange={(itemValue) => setSelectedStudentId(Number(itemValue))}
                >
                  <Picker.Item label="Select a student" value="" />
                  {students.map((student) => (
                    <Picker.Item key={student.id} label={student.name} value={student.id} />
                  ))}
                </Picker>
              </View>

              <Text style={styles.label}>Payment Amount</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={paymentAmount}
                onChangeText={setPaymentAmount}
                placeholder="Enter amount"
              />

              <Text style={styles.label}>Payment Date</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={styles.datePickerButton}
              >
                <Text style={styles.datePickerText}>{paymentDate.toISOString().split('T')[0]}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={paymentDate}
                  mode="date"
                  display="default"
                  onChange={onChangeDate}
                  maximumDate={new Date()}
                />
              )}

              <Text style={styles.label}>Payment Method</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={paymentMethod}
                  onValueChange={(itemValue) => setPaymentMethod(itemValue)}
                >
                  <Picker.Item label="Cash" value="cash" />
                  <Picker.Item label="Card" value="card" />
                  <Picker.Item label="Cheque" value="cheque" />
                  <Picker.Item label="UPI" value="upi" />
                </Picker>
              </View>

              {(paymentMethod === 'card' || paymentMethod === 'cheque' || paymentMethod === 'upi') && (
                <>
                  <Text style={styles.label}>
                    {paymentMethod === 'card'
                      ? 'Card Details'
                      : paymentMethod === 'cheque'
                      ? 'Cheque Details'
                      : 'UPI Details'}
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={paymentDetails}
                    onChangeText={setPaymentDetails}
                    placeholder={
                      paymentMethod === 'card'
                        ? 'Card Number, Expiry, etc.'
                        : paymentMethod === 'cheque'
                        ? 'Cheque Number, Bank, etc.'
                        : 'UPI ID, Transaction Reference, etc.'
                    }
                  />
                </>
              )}

              {submitError && <Text style={styles.errorText}>{submitError}</Text>}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={closePaymentModal}
                  disabled={submitLoading}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.submitButton]}
                  onPress={handlePaymentSubmit}
                  disabled={submitLoading}
                >
                  <Text style={styles.modalButtonText}>
                    {submitLoading ? 'Recording...' : 'Record Payment'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, styles.totalCard]}>
          <Text style={styles.summaryTitle}>Total Fees</Text>
          <Text style={styles.summaryAmount}>₹{totalFees.toLocaleString()}</Text>
        </View>
        <View style={[styles.summaryCard, styles.collectedCard]}>
          <Text style={styles.summaryTitle}>Collected</Text>
          <Text style={styles.summaryAmount}>₹{totalCollected.toLocaleString()}</Text>
          <Text style={styles.summaryPercent}>
            {totalFees > 0 ? `${Math.round((totalCollected / totalFees) * 100)}% of total` : '0% of total'}
          </Text>
        </View>
        <View style={[styles.summaryCard, styles.pendingCard]}>
          <Text style={styles.summaryTitle}>Pending</Text>
          <Text style={styles.summaryAmount}>₹{totalPending.toLocaleString()}</Text>
          <Text style={styles.summaryPercent}>
            {totalFees > 0 ? `${Math.round((totalPending / totalFees) * 100)}% of total` : '0% of total'}
          </Text>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by student name, ID, or category..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        <View style={styles.pickerContainerFilter}>
          <Picker
            selectedValue={statusFilter}
            onValueChange={(itemValue) => setStatusFilter(itemValue)}
          >
            <Picker.Item label="All Status" value="All" />
            <Picker.Item label="Paid" value="Paid" />
            <Picker.Item label="Partial" value="Partial" />
            <Picker.Item label="Unpaid" value="Unpaid" />
          </Picker>
        </View>

        <TouchableOpacity style={styles.exportButton} onPress={() => Alert.alert('Export', 'Export functionality not implemented')}>
          <Icon name="download" size={20} color="#fff" />
          <Text style={styles.exportButtonText}>Export</Text>
        </TouchableOpacity>
      </View>

      {showTable && (
        <>
          <Text style={styles.tableTitle}>Fee Summary</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.feeCellName]}>Student</Text>
            <Text style={[styles.tableHeaderCell, styles.feeCellCategory]}>Category</Text>
            <Text style={styles.tableHeaderCell}>Total Amount</Text>
            <Text style={styles.tableHeaderCell}>Paid</Text>
            <Text style={styles.tableHeaderCell}>Due</Text>
            <Text style={styles.tableHeaderCell}>Status</Text>
            <Text style={styles.tableHeaderCell}>Actions</Text>
          </View>
          <FlatList
            data={filteredFeeSummary}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderFeeItem}
            ListEmptyComponent={<Text style={styles.emptyText}>No fee records found</Text>}
          />

          <Text style={[styles.tableTitle, { marginTop: 20 }]}>Fee Payments</Text>
          <View style={[styles.tableHeader, { backgroundColor: '#e2e8f0' }]}>
            <Text style={[styles.tableHeaderCell, styles.paymentCellName]}>Student</Text>
            <Text style={styles.tableHeaderCell}>Payment Date</Text>
            <Text style={styles.tableHeaderCell}>Payment Method</Text>
            <Text style={styles.tableHeaderCell}>Amount</Text>
            <Text style={styles.tableHeaderCell}>Description</Text>
          </View>
          <FlatList
            data={payments}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderPaymentItem}
            ListEmptyComponent={<Text style={styles.emptyText}>No payment records found</Text>}
          />
        </>
      )}

      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          Showing <Text style={styles.resultsCount}>{filteredFeeSummary.length}</Text> results
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937', // gray-900
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#6b7280', // gray-500
  },
  toggleButton: {
    backgroundColor: '#2563eb', // blue-600
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  toggleButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  errorText: {
    color: '#dc2626', // red-600
    marginVertical: 8,
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
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 4,
    color: '#374151', // gray-700
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db', // gray-300
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#111827', // gray-900
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 12,
  },
  datePickerText: {
    fontSize: 16,
    color: '#111827',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#9ca3af', // gray-400
  },
  submitButton: {
    backgroundColor: '#2563eb', // blue-600
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  totalCard: {
    backgroundColor: '#dbeafe', // blue-100
  },
  collectedCard: {
    backgroundColor: '#dcfce7', // green-100
  },
  pendingCard: {
    backgroundColor: '#fee2e2', // red-100
  },
  summaryTitle: {
    fontSize: 16,
    color: '#6b7280', // gray-500
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e40af', // blue-900
  },
  summaryPercent: {
    fontSize: 12,
    color: '#16a34a', // green-600
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    top: 12,
    left: 8,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingLeft: 32,
    paddingVertical: 8,
    fontSize: 16,
    color: '#111827',
  },
  pickerContainerFilter: {
    width: 140,
    marginLeft: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 12,
  },
  exportButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
  },
  tableTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  tableHeaderCell: {
    flex: 1,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  feeCellName: {
    flex: 2,
    textAlign: 'left',
    paddingLeft: 8,
  },
  feeCellCategory: {
    flex: 1.5,
    textAlign: 'center',
  },
  feeCell: {
    flex: 1,
    textAlign: 'center',
  },
  feeCellStatus: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
  },
  statusPaid: {
    color: '#16a34a', // green-600
  },
  statusPartial: {
    color: '#f97316', // orange-500
  },
  statusUnpaid: {
    color: '#dc2626', // red-600
  },
  paid: {
    color: '#16a34a',
  },
  due: {
    color: '#dc2626',
  },
  feeRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  updateButton: {
    color: '#2563eb',
    fontWeight: '600',
    textAlign: 'center',
  },
  paymentRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  paymentCellName: {
    flex: 2,
    textAlign: 'left',
    paddingLeft: 8,
  },
  paymentCell: {
    flex: 1,
    textAlign: 'center',
  },

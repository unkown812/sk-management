import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons, FontAwesome5} from '@expo/vector-icons';
import { paymentService } from '../../services/paymentService';

interface Payment {
  id: number;
  payment_date: string;
  description: string;
  amount: number;
  status: string;
}

interface StudentFeeHistoryProps {
  studentId: string;
}

const StudentFeeHistory: React.FC<StudentFeeHistoryProps> = ({ studentId }) => {
  const [feeHistory, setFeeHistory] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentNotes, setPaymentNotes] = useState('');

  useEffect(() => {
    const fetchFeeHistory = async () => {
      try {
        setLoading(true);
        const data = await paymentService.getByStudentId(studentId);
        setFeeHistory(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch fee history');
      } finally {
        setLoading(false);
      }
    };

    fetchFeeHistory();
  }, [studentId]);

  // Calculate total paid and total due
  const totalAmount = feeHistory.reduce((sum, fee) => sum + fee.amount, 0);
  const totalPaid = feeHistory
    .filter(fee => fee.status === 'Paid')
    .reduce((sum, fee) => sum + fee.amount, 0);
  const totalDue = totalAmount - totalPaid;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading fee history...</Text>
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

  const renderPaymentItem = ({ item }: { item: Payment }) => (
    <View style={styles.paymentRow}>
      <Text style={[styles.paymentCell, styles.receiptNo]}>R-{item.id.toString().padStart(4, '0')}</Text>
      <Text style={[styles.paymentCell, styles.date]}>{new Date(item.payment_date).toLocaleDateString()}</Text>
      <Text style={[styles.paymentCell, styles.description]}>{item.description}</Text>
      <Text style={[styles.paymentCell, styles.amount]}>₹{item.amount.toLocaleString()}</Text>
      <View style={[styles.paymentCell, styles.statusCell]}>
        <Text style={[styles.statusBadge, item.status === 'Paid' ? styles.paidBadge : styles.dueBadge]}>
          {item.status}
        </Text>
      </View>
      <TouchableOpacity style={[styles.paymentCell, styles.actionCell]} onPress={() => { /* Placeholder for view receipt */ }}>
        <Text style={styles.actionText}>View Receipt</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Fee summary */}
      <View style={styles.summaryContainer}>
        <View style={[styles.card, styles.blueCard]}>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Total Fee</Text>
            <Text style={styles.cardValue}>₹{totalAmount.toLocaleString()}</Text>
            <MaterialIcons name="credit-card" size={24} color="#2563eb" />
          </View>
        </View>

        <View style={[styles.card, styles.greenCard]}>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Amount Paid</Text>
            <Text style={[styles.cardValue, styles.greenText]}>₹{totalPaid.toLocaleString()}</Text>
            <FontAwesome5 name="file-invoice" size={24} color="#16a34a" />
          </View>
        </View>

        <View style={[styles.card, styles.redCard]}>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Amount Due</Text>
            <Text style={[styles.cardValue, styles.redText]}>₹{totalDue.toLocaleString()}</Text>
            <MaterialIcons name="credit-card" size={24} color="#dc2626" />
          </View>
        </View>
      </View>

      {/* Fee receipt list */}
      <View style={styles.paymentHistoryHeader}>
        <Text style={styles.paymentHistoryTitle}>Payment History</Text>
        <TouchableOpacity style={styles.printButton} onPress={() => { /* Placeholder for print statement */ }}>
          <MaterialIcons name="print" size={20} color="#2563eb" />
          <Text style={styles.printButtonText}>Print Statement</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.paymentTableHeader}>
        <Text style={[styles.paymentCell, styles.receiptNo, styles.headerText]}>Receipt No.</Text>
        <Text style={[styles.paymentCell, styles.date, styles.headerText]}>Date</Text>
        <Text style={[styles.paymentCell, styles.description, styles.headerText]}>Description</Text>
        <Text style={[styles.paymentCell, styles.amount, styles.headerText]}>Amount</Text>
        <Text style={[styles.paymentCell, styles.statusCell, styles.headerText]}>Status</Text>
        <Text style={[styles.paymentCell, styles.actionCell, styles.headerText]}>Action</Text>
      </View>

      <FlatList
        data={feeHistory}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPaymentItem}
        ListEmptyComponent={<Text style={styles.noRecordsText}>No fee history found</Text>}
      />

      {/* Payment options (if there is due amount) */}
      {totalDue > 0 && (
        <View style={styles.paymentForm}>
          <Text style={styles.paymentFormTitle}>Make a Payment</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Payment Amount (₹)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Enter amount"
              value={paymentAmount}
              onChangeText={setPaymentAmount}
              defaultValue={totalDue.toString()}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Payment Method</Text>
            <Picker
              selectedValue={paymentMethod}
              onValueChange={(itemValue) => setPaymentMethod(itemValue)}
              mode="dropdown"
            >
              <Picker.Item label="Cash" value="cash" />
              <Picker.Item label="Credit/Debit Card" value="card" />
              <Picker.Item label="UPI" value="upi" />
              <Picker.Item label="Net Banking" value="netbanking" />
              <Picker.Item label="Cheque" value="cheque" />
            </Picker>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Payment Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={paymentDate}
              onChangeText={setPaymentDate}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              multiline
              numberOfLines={2}
              placeholder="Add any notes about this payment"
              value={paymentNotes}
              onChangeText={setPaymentNotes}
            />
          </View>

          <View style={styles.formGroup}>
            <TouchableOpacity style={styles.processButton} onPress={() => { /* Placeholder for process payment */ }}>
              <Text style={styles.processButtonText}>Process Payment</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
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
  blueCard: {
    backgroundColor: '#dbeafe',
  },
  greenCard: {
    backgroundColor: '#dcfce7',
  },
  redCard: {
    backgroundColor: '#fee2e2',
  },
  greenText: {
    color: '#16a34a',
  },
  redText: {
    color: '#dc2626',
  },
  paymentHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentHistoryTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  printButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  printButtonText: {
    marginLeft: 4,
    color: '#2563eb',
    fontWeight: '600',
  },
  paymentTableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    paddingBottom: 8,
  },
  paymentRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    alignItems: 'center',
  },
  paymentCell: {
    flex: 1,
    fontSize: 14,
  },
  receiptNo: {
    flex: 1,
  },
  date: {
    flex: 1,
  },
  description: {
    flex: 2,
  },
  amount: {
    flex: 1,
  },
  statusCell: {
    flex: 1,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  paidBadge: {
    backgroundColor: '#22c55e',
    color: '#fff',
    fontWeight: '600',
  },
  dueBadge: {
    backgroundColor: '#facc15',
    color: '#000',
    fontWeight: '600',
  },
  actionCell: {
    flex: 1,
  },
  actionText: {
    color: '#2563eb',
    fontWeight: '600',
  },
  noRecordsText: {
    textAlign: 'center',
    color: '#6b7280',
    paddingVertical: 16,
  },
  headerText: {
    fontWeight: '600',
  },
  paymentForm: {
    marginTop: 24,
    padding: 12,
    backgroundColor: '#dbeafe',
    borderRadius: 8,
  },
  paymentFormTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  formGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
  },
  textArea: {
    height: 60,
    textAlignVertical: 'top',
  },
  processButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  processButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default StudentFeeHistory;

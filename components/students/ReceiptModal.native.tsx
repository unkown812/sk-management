import React from 'react';
import { View, Text, Modal, ScrollView, Image, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

interface Student {
  id?: number;
  name: string;
  category: string;
  course: string;
  year: number | null;
  semester: number | null;
  email: string;
  phone: string;
  enrollment_date: string;
  created_at: string;
  fee_status: string;
  total_fee: number | null;
  paid_fee: number | null;
  due_amount: number | null;
  last_payment: string;
  birthday: string;
  installment_amt: number[];
  installments: number | null;
  installment_dates?: string[];
  enrollment_year: number[];
  subjects_enrolled: string[];
}

interface ReceiptModalProps {
  student: Student | null;
  onClose: () => void;
  visible: boolean;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ student, onClose, visible }) => {
  if (!student) return null;

  const numberToWords = (num: number): string => {
    if (num === 0) return 'Zero';

    const a = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
      'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
    ];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const numToWords = (n: number): string => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
      if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + numToWords(n % 100) : '');
      if (n < 100000) return numToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + numToWords(n % 1000) : '');
      if (n < 10000000) return numToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + numToWords(n % 100000) : '');
      return numToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + numToWords(n % 10000000) : '');
    };

    return numToWords(num);
  };

  const renderInstallment = ({ item, index }: { item: number; index: number }) => (
    <View style={styles.installmentItem}>
      <Text>Amount: ₹{item} - Date: {student.installment_dates && student.installment_dates[index] ? new Date(student.installment_dates[index]).toLocaleDateString() : 'N/A'}</Text>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
          <Text style={styles.title}>SK CLASSES</Text>
          <View style={styles.separator} />
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text><Text style={styles.bold}>Receipt No. :</Text> {student.id ?? 'N/A'}</Text>
            <Text><Text style={styles.bold}>Date:</Text> {new Date().toLocaleDateString()}</Text>
          </View>
          <Text style={styles.marginBottom}><Text style={styles.bold}>Received with thanks from :</Text> {student.name}</Text>
          <View style={styles.row}>
            <Text><Text style={styles.bold}>Standard:</Text> {student.category} {student.course} {student.year ?? ''}</Text>
            <Text><Text style={styles.bold}>Cheque No.:</Text> </Text>
          </View>
          <View style={styles.marginBottom}>
            <Text style={styles.bold}>Installments:</Text>
            <FlatList
              data={student.installment_amt}
              renderItem={renderInstallment}
              keyExtractor={(_, index) => index.toString()}
            />
          </View>
          <Text style={styles.marginBottom}><Text style={styles.bold}>Cash / Cheque for Rs.:</Text> {student.paid_fee ?? 0}</Text>
          <Text style={styles.marginBottom}><Text style={styles.bold}>Dated:</Text> {student.last_payment ? new Date(student.last_payment).toLocaleDateString() : ''}</Text>
          <Text style={styles.marginBottom}><Text style={styles.bold}>Rupees in Words ({numberToWords(student.paid_fee ?? 0)})</Text></Text>
        </View>

        <View style={styles.feesTable}>
          <View style={[styles.feesRow, styles.feesHeader]}>
            <Text style={[styles.feesCell, styles.borderRight]}>Course Fees</Text>
            <Text style={[styles.feesCell, styles.borderRight]}>Installment</Text>
            <Text style={styles.feesCell}>Balance Amt.</Text>
          </View>
          <View style={styles.feesRow}>
            <Text style={[styles.feesCell, styles.borderRight]}>{student.total_fee}</Text>
            <Text style={[styles.feesCell, styles.borderRight]}>{student.paid_fee}</Text>
            <Text style={styles.feesCell}>{student.due_amount}</Text>
          </View>
        </View>

        <View style={styles.notes}>
          <Text>Attendance and punctuality in the class is compulsory.</Text>
          <Text>Tuition fees shall not be refunded or transferred to any other students name under any circumstances.</Text>
        </View>

        <View style={styles.footer}>
          <Text>For SK CLASSES</Text>
          <Text>Auth. Sign</Text>
        </View>

        <View style={styles.buttons}>
          {/* Printing is not supported in React Native, so this button is omitted */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  separator: {
    borderBottomWidth: 4,
    borderBottomColor: '#000',
    width: '100%',
    marginTop: 8,
  },
  section: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  bold: {
    fontWeight: 'bold',
  },
  marginBottom: {
    marginBottom: 8,
  },
  installmentItem: {
    marginLeft: 16,
    marginBottom: 4,
  },
  feesTable: {
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 20,
  },
  feesRow: {
    flexDirection: 'row',
  },
  feesHeader: {
    backgroundColor: '#d1d5db',
  },
  feesCell: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 8,
    borderColor: '#000',
    borderRightWidth: 1,
  },
  borderRight: {
    borderRightWidth: 1,
  },
  notes: {
    marginBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  closeButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default ReceiptModal;

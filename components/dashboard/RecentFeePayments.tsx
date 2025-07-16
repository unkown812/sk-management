import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { paymentService } from '../../services/paymentService';

interface Payment {
  id: number;
  student_name: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  description: string;
}

const RecentFeePayments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const data = await paymentService.getAll();
        setPayments(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch payments');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading recent fee payments...</Text>
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

  const renderItem = ({ item }: { item: Payment }) => (
    <View style={styles.row}>
      <Text style={[styles.cell, styles.student]}>{item.student_name}</Text>
      <Text style={[styles.cell, styles.amount]}>₹{item.amount}</Text>
      <Text style={[styles.cell, styles.method]}>{item.payment_method}</Text>
      <Text style={[styles.cell, styles.date]}>{new Date(item.payment_date).toLocaleDateString()}</Text>
      <Text style={[styles.cell, styles.description]}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.row, styles.header]}>
        <Text style={[styles.cell, styles.student, styles.headerText]}>Student</Text>
        <Text style={[styles.cell, styles.amount, styles.headerText]}>Amount</Text>
        <Text style={[styles.cell, styles.method, styles.headerText]}>Method</Text>
        <Text style={[styles.cell, styles.date, styles.headerText]}>Date</Text>
        <Text style={[styles.cell, styles.description, styles.headerText]}>Description</Text>
      </View>
      <FlatList
        data={payments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 8,
    alignItems: 'center',
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#f3f4f6',
  },
  cell: {
    flex: 1,
    paddingHorizontal: 4,
  },
  student: {
    flex: 2,
  },
  amount: {
    flex: 1,
  },
  method: {
    flex: 1,
  },
  date: {
    flex: 1,
  },
  description: {
    flex: 2,
  },
  headerText: {
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
});

export default RecentFeePayments;

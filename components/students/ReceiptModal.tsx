import React from 'react';

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

  const ReceiptModal: React.FC<{ student: Student | null; onClose: () => void }> = ({ student, onClose }) => {
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

    const handlePrint = () => {
      window.print();
    };

    return (
      <div className="fixed inset-0 bg-white p-10 w-full max-w-md max-h-[90vh] overflow-auto print:p-0 print:max-w-full print:max-h-full print:overflow-visible print:bg-white print:shadow-none print:rounded-none">
        <div className="text-center mb-4">
          <img src="/src/assets/logo.png" alt="SK Classes Logo" className="mx-auto mb-2 w-20 h-20" />
          <h1 className="text-3xl font-bold mb-1">SK CLASSES</h1>
          <hr className="border-t-4 border-black mb-4" />
        </div>
        <div className="text-left text-sm mb-4">
          <div className="flex justify-between mb-1">
            <span><strong>Receipt No. :</strong> {student.id ?? 'N/A'}</span>
            <span><strong>Date:</strong> {new Date().toLocaleDateString()}</span>
          </div>
          <div className="mb-1">
            <strong>Received with thanks from :</strong> {student.name}
          </div>
          <div className="flex justify-between mb-1">
            <span><strong>Standard:</strong> {student.category} {student.course} {student.year ?? ''}</span>
            <span><strong>Cheque No.:</strong> </span>
          </div>
          <div className="mb-1">
            <strong>Installments:</strong>
            <ul className="list-disc list-inside">
              {student.installment_amt && student.installment_amt.map((amt, index) => (
                <li key={index}>
                  Amount: ₹{amt} - Date: {student.installment_dates && student.installment_dates[index] ? new Date(student.installment_dates[index]).toLocaleDateString() : 'N/A'}
                </li>
              ))}
            </ul>
          </div>
          <div className="mb-1">
            <strong>Cash / Cheque for Rs.:</strong> {student.paid_fee ?? 0}
          </div>
          <div className="mb-1">
            <strong>Dated:</strong> {student.last_payment ? new Date(student.last_payment).toLocaleDateString() : ''}
          </div>
          <div className="mb-1">
            <strong>Rupees in Words ({numberToWords(student.paid_fee ?? 0)})</strong>
          </div>
        </div>
        <div className="border border-black mb-4">
          <div className="bg-gray-300 font-bold text-center border-b border-black py-1">FEES</div>
          <div className="grid grid-cols-3 border-t border-black text-center text-sm">
            <div className="border-r border-black py-1">Course Fees</div>
            <div className="border-r border-black py-1">Installment</div>
            <div className="py-1">Balance Amt.</div>
          </div>
          <div className="grid grid-cols-3 border-t border-black text-center text-sm">
            <div className="border-r border-black py-2">{student.total_fee}</div>
            <div className="border-r border-black py-2">{student.paid_fee}</div>
            <div className="py-2">{student.due_amount}</div>
          </div>
        </div>
        <div className="text-left text-xs mb-4">
          <p>Attendance and punctuality in the class is compulsory.</p>
          <p>Tuition fees shall not be refunded or transferred to any other students name under any circumstances.</p>
        </div>
        <div className="flex justify-between text-sm font-semibold">
          <div>For SK CLASSES</div>
          <div>Auth. Sign</div>
        </div>
        <div className="mt-4 flex justify-center print:hidden">
          <button className="btn-primary mr-4" onClick={handlePrint}>Print Receipt</button>
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  };

export default ReceiptModal;
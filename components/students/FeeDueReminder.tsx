import React from 'react';

interface Student {
  id?: number;
  name: string;
  category: string;
  course: string;
  year: number | null;
  phone: string;
  paid_fee: number | null;
  total_fee: number | null;
  due_amount: number | null;
  last_payment: string;
}

interface FeeDueReminderProps {
  showFeeDueReminder: boolean;
  dueStudents: Student[];
  onDismiss: () => void;
  onSendWhatsAppMessages: () => void;
}

const FeeDueReminder: React.FC<FeeDueReminderProps> = ({
  showFeeDueReminder,
  dueStudents,
  onDismiss,
  onSendWhatsAppMessages,
}) => {
  if (!showFeeDueReminder) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 z-50 flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <strong className="font-bold">Fee Due Reminder:</strong>
        <ul className="list-disc list-inside">
          {dueStudents.map(student => (
            <li key={student.id}>
              {student.name} - Due: ₹{student.due_amount} - Contact: {student.phone}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-2 md:mt-0 flex space-x-2">
        <button
          className="btn-primary"
          onClick={onSendWhatsAppMessages}
        >
          Send WhatsApp Messages
        </button>
        <button
          className="btn-secondary"
          onClick={onDismiss}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};

export default FeeDueReminder;

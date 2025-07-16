import React, { useEffect, useState } from 'react';
import supabase from '../../lib/supabase';

interface Student {
  id?: number;
  name: string;
  installment_dates?: string[];
}

const DueDateReminder: React.FC = () => {
  const [dueTodayStudents, setDueTodayStudents] = useState<{student: Student, dueDates: string[]}[]>([]);
  const [showReminder, setShowReminder] = useState(true);

  useEffect(() => {
    const fetchStudentsWithDueToday = async () => {
      try {
        const todayDate = new Date();
        const todayStr = todayDate.toISOString().split('T')[0]; // yyyy-mm-dd

        const { data, error } = await supabase
          .from('students')
          .select('id, name, installment_dates');

        if (error) {
          console.error('Error fetching students:', error);
          return;
        }

        if (data && data.length > 0) {
          // Filter students who have installment_dates containing todayStr
          const studentsDueToday = data
            .map((student: Student) => {
              const dueDatesToday = (student.installment_dates || []).filter(dateStr => dateStr === todayStr);
              if (dueDatesToday.length > 0) {
                return { student, dueDates: dueDatesToday };
              }
              return null;
            })
            .filter((item): item is {student: Student, dueDates: string[]} => item !== null);

          if (studentsDueToday.length > 0) {
            setDueTodayStudents(studentsDueToday);
            setShowReminder(true);

            // Show browser notification
            if (Notification.permission === 'granted') {
              new Notification('Installment Due Date Reminder', {
                body: `You have ${studentsDueToday.length} student(s) with installment due today.`,
              });
            } else if (Notification.permission !== 'denied') {
              Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                  new Notification('Installment Due Date Reminder', {
                    body: `You have ${studentsDueToday.length} student(s) with installment due today.`,
                  });
                }
              });
            }
          } else {
            setDueTodayStudents([]);
            setShowReminder(false);
          }
        } else {
          setDueTodayStudents([]);
          setShowReminder(false);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      }
    };

    fetchStudentsWithDueToday();
  }, []);

  if (!showReminder || dueTodayStudents.length === 0) {
    return null;
  }

  return (
    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4" role="alert">
      <strong className="font-bold">Installment Due Date Reminder!</strong>
      <span className="block sm:inline"> The following students have installment(s) due today ({new Date().toISOString().split('T')[0]}):</span>
      <ul className="list-disc list-inside mt-2">
        {dueTodayStudents.map(({student, dueDates}) => (
          <li key={student.id}>
            {student.name} - Due Date(s): {dueDates.join(', ')}
          </li>
        ))}
      </ul>
      <button
        onClick={() => setShowReminder(false)}
        className="absolute top-0 bottom-0 right-0 px-4 py-4"
        aria-label="Close"
      >
        <svg className="fill-current h-6 w-6 text-yellow-700" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <title>Close</title>
          <path d="M14.348 5.652a1 1 0 00-1.414 0L10 8.586 7.066 5.652a1 1 0 10-1.414 1.414L8.586 10l-2.934 2.934a1 1 0 101.414 1.414L10 11.414l2.934 2.934a1 1 0 001.414-1.414L11.414 10l2.934-2.934a1 1 0 000-1.414z"/>
        </svg>
      </button>
    </div>
  );
};

export default DueDateReminder;

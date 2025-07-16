import React, { useEffect, useState } from 'react';
import supabase from '../../lib/supabase';

interface Student {
  id?: number;
  name: string;
  birthday: string; // stored as YYYY-MM-DD
}

const BirthdayReminder: React.FC = () => {
  const [birthdayTodayStudents, setBirthdayTodayStudents] = useState<Student[]>([]);
  const [showReminder, setShowReminder] = useState(true);

  useEffect(() => {
    const fetchStudentsWithBirthdayToday = async () => {
      try {
        const today = new Date();
        const monthDay = today.toISOString().slice(5, 10); // MM-DD

        const { data, error } = await supabase
          .from('students')
          .select('id, name, birthday');

        if (error) {
          console.error('Error fetching students for birthday reminder:', error);
          return;
        }

        if (data && data.length > 0) {
          // Filter students whose birthday matches today's month and day
          const birthdayStudents = data.filter(student => {
            if (!student.birthday) return false;
            return student.birthday.slice(5, 10) === monthDay;
          });

          if (birthdayStudents.length > 0) {
            setBirthdayTodayStudents(birthdayStudents);
            setShowReminder(true);
            // Show browser notification
            if (Notification.permission === 'granted') {
              new Notification('Birthday Reminder', {
                body: `You have ${birthdayStudents.length} student(s) with birthday today.`,
              });
            } else if (Notification.permission !== 'denied') {
              Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                  new Notification('Birthday Reminder', {
                    body: `You have ${birthdayStudents.length} student(s) with birthday today.`,
                  });
                }
              });
            }
          } else {
            setBirthdayTodayStudents([]);
            setShowReminder(false);
          }
        } else {
          setBirthdayTodayStudents([]);
          setShowReminder(false);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      }
    };

    fetchStudentsWithBirthdayToday();
  }, []);

  if (!showReminder || birthdayTodayStudents.length === 0) {
    return null;
  }

  return (
    <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4" role="alert">
      <strong className="font-bold">Birthday Reminder!</strong>
      <span className="block sm:inline"> The following students have birthday today ({new Date().toLocaleDateString()}):</span>
      <ul className="list-disc list-inside mt-2">
        {birthdayTodayStudents.map(student => (
          <li key={student.id}>{student.name}</li>
        ))}
      </ul>
      <button
        onClick={() => setShowReminder(false)}
        className="absolute top-0 bottom-0 right-0 px-4 py-3"
        aria-label="Close"
      >
        <svg className="fill-current h-6 w-6 text-blue-700" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <title>Close</title>
          <path d="M14.348 5.652a1 1 0 00-1.414 0L10 8.586 7.066 5.652a1 1 0 10-1.414 1.414L8.586 10l-2.934 2.934a1 1 0 101.414 1.414L10 11.414l2.934 2.934a1 1 0 001.414-1.414L11.414 10l2.934-2.934a1 1 0 000-1.414z"/>
        </svg>
      </button>
    </div>
  );
};

export default BirthdayReminder;

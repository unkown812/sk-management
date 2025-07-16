import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import supabase from '../../lib/supabase';

interface Exam {
  id: number;
  name: string;
  date: string;
  course?: string;
  category?: string;
  year?: number;
}

const UpcomingExams: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [todayExam, setTodayExam] = useState<Exam | null>(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const { data, error } = await supabase
          .from('exams')
          .select('id, name, category, course, year, date');
        if (error) {
          console.error('Error fetching exams:', error);
          return;
        }
        const examsData = data || [];
        setExams(examsData);

        // Check for exam scheduled today
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const examToday = examsData.find((exam) => exam.date === todayStr) || null;
        setTodayExam(examToday);

        // Push notification if exam today
        if (examToday && "Notification" in window) {
          if (Notification.permission === "granted") {
            new Notification("Exam Reminder", {
              body: `You have an exam scheduled today: ${examToday.name}`,
            });
          } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
              if (permission === "granted") {
                new Notification("Exam Reminder", {
                  body: `You have an exam scheduled today: ${examToday.name}`,
                });
              }
            });
          }
        }
      } catch (err) {
        console.error('Unexpected error fetching exams:', err);
      }
    };

    fetchExams();
  }, []);

  return (
    <div className="space-y-4 overflow-y-scroll">
      {todayExam && (
        <div className="p-3 mb-4 border border-yellow-400 bg-yellow-50 rounded text-yellow-800 font-semibold">
          Reminder: You have an exam scheduled today: {todayExam.name}
        </div>
      )}
      {exams.map((exam) => (
        <div key={exam.id} className="flex space-x-4 p-3 border rounded-lg hover:bg-gray-50">
          <div className="flex-shrink-0 bg-blue-100 text-blue-800 rounded-lg p-3 text-center">
            <Calendar className="h-5 w-5 mx-auto" />
            <div className="text-xs mt-1 font-medium">
              {new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>
          <div>
            <h3 className="font-medium">{exam.name}</h3>
            <div className="flex flex-wrap gap-3 mt-1">
              {exam.course && <span className="text-blue-600">{exam.course}</span>}
              {exam.category && <span className="text-green-700">{exam.category}</span>}
              {exam.year !== undefined && <span className="text-orange-600">{exam.year}th</span>}
            </div>
          </div>
        </div>
      ))}
      <div className="mt-2">
        <button className="text-sm text-primary font-medium hover:underline">
          View all exams →
        </button>
      </div>
    </div>
  );
};

export default UpcomingExams;

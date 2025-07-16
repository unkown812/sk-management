import React, { useState } from 'react';
import supabase from '../lib/supabase';

interface Exam {
  id: number;
  examName: string;
  date: string;
  marks: number;
}


const ScheduleExam: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [course, setCourse] = useState<string>('');
  const [year, setYear] = useState<number | ''>('');
  const [subject, setSubject] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setFormError('Please enter the exam name.');
      return;
    }
    if (!date) {
      setFormError('Please select the exam date.');
      return;
    }
    if (!category.trim()) {
      setFormError('Please enter the category.');
      return;
    }
    if (!course.trim()) {
      setFormError('Please enter the course.');
      return;
    }
    if (year === '' || year <= 0) {
      setFormError('Please enter a valid year.');
      return;
    }
    if (!subject.trim()) {
      setFormError('Please enter the subject.');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('exams').insert([
        {
          name: name.trim(),
          date: date,
          category: category.trim(),
          course: course.trim(),
          year: Number(year),
          subject: subject.trim(),
          marks:Number(marks),
        },
      ]);
      if (error) throw error;
      setSuccessMessage('Exam scheduled successfully.');
      setName('');
      setDate('');
      setCategory('');
      setCourse('');
      setYear('');
      setSubject('');
    } catch (err) {
      setFormError((err as Error).message || 'Failed to schedule exam.');
    }
    setSaving(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-semibold mb-4">Schedule New Exam</h1>
      {formError && <div className="mb-4 text-red-600">{formError}</div>}
      {successMessage && <div className="mb-4 text-green-600">{successMessage}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Exam Name
          </label>
          <input
            type="text"
            id="name"
            className="input-field w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            id="date"
            className="input-field w-full"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <input
            type="text"
            id="category"
            className="input-field w-full"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
            Course
          </label>
          <input
            type="text"
            id="course"
            className="input-field w-full"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
            Year
          </label>
          <input
            type="number"
            id="year"
            className="input-field w-full"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            min={1}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <input
            type="text"
            id="subject"
            className="input-field w-full"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="btn-primary"
            disabled={saving}
          >
            {saving ? 'Scheduling...' : 'Schedule Exam'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScheduleExam;

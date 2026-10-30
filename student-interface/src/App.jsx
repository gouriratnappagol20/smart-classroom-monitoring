import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import InstructionsPage from './pages/InstructionsPage';
import ExaminationPage from './pages/ExaminationPage';
import SubmissionPage from './pages/SubmissionPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('login'); // 'login' | 'instructions' | 'exam' | 'submission'
  const [currentStudent, setCurrentStudent] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [eventLogs, setEventLogs] = useState([]);

  // Handle successful login
  const handleLoginSuccess = (studentData) => {
    setCurrentStudent(studentData);
    setCurrentPage('instructions');
  };

  // Start Exam
  const handleStartExam = () => {
    setCurrentPage('exam');
  };

  // Exam Finish & Submission
  const handleFinishSubmission = (result) => {
    setSubmissionResult(result);
    setCurrentPage('submission');
  };

  // Reset back to portal login
  const handleResetToLogin = () => {
    setCurrentStudent(null);
    setSubmissionResult(null);
    setCurrentPage('login');
  };

  // Log monitoring events
  const handleLogMonitoringEvent = (event) => {
    setEventLogs(prev => [event, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans">
      {currentPage === 'login' && (
        <LoginPage 
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {currentPage === 'instructions' && (
        <InstructionsPage 
          student={currentStudent}
          onStartExam={handleStartExam}
          onBackToLogin={() => setCurrentPage('login')}
        />
      )}

      {currentPage === 'exam' && (
        <ExaminationPage 
          student={currentStudent}
          onFinishSubmission={handleFinishSubmission}
          onLogMonitoringEvent={handleLogMonitoringEvent}
        />
      )}

      {currentPage === 'submission' && (
        <SubmissionPage 
          submissionResult={submissionResult}
          onResetToLogin={handleResetToLogin}
        />
      )}
    </div>
  );
}


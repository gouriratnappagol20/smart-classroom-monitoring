import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import QuestionCard from '../components/QuestionCard';
import QuestionNavigation from '../components/QuestionNavigation';
import WarningBanner from '../components/WarningBanner';
import SubmitConfirmModal from '../components/SubmitConfirmModal';
import AgentStatusBadge from '../components/AgentStatusBadge';
import { sampleQuestions, examMetadata } from '../data/examQuestions';
import { BrowserMonitor } from '../monitoring/browserMonitor';
import { ApplicationMonitor } from '../monitoring/applicationMonitor';
import { saveAnswerApi, sendMonitoringEventApi } from '../services/api';

export default function ExaminationPage({ 
  student, 
  onFinishSubmission, 
  onLogMonitoringEvent 
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState([]);
  const [secondsLeft, setSecondsLeft] = useState(examMetadata.durationMinutes * 60);
  
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [activeWarning, setActiveWarning] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Monitor References
  const browserMonitorRef = useRef(null);
  const appMonitorRef = useRef(null);

  const currentQuestion = sampleQuestions[currentIndex];

  // 1. Dual Activity Monitoring Setup
  useEffect(() => {
    // A. Initialize Browser Monitor (Type 1)
    const browserMonitor = new BrowserMonitor({
      studentId: student?.id,
      examId: examMetadata.examId,
      onWarning: (warningData) => {
        setActiveWarning(warningData);
      },
      onEventLogged: (event) => {
        sendMonitoringEventApi(event);
        if (onLogMonitoringEvent) onLogMonitoringEvent(event);
      }
    });

    browserMonitor.start();
    browserMonitorRef.current = browserMonitor;

    // B. Initialize Application Monitor (Type 2)
    const appMonitor = new ApplicationMonitor({
      studentId: student?.id,
      examId: examMetadata.examId,
      onWarning: (warningData) => {
        setActiveWarning(warningData);
      },
      onEventLogged: (event) => {
        sendMonitoringEventApi(event);
        if (onLogMonitoringEvent) onLogMonitoringEvent(event);
      }
    });

    appMonitor.start();
    appMonitorRef.current = appMonitor;

    // Cleanup when exam ends
    return () => {
      browserMonitor.stop();
      appMonitor.stop();
    };
  }, [student, onLogMonitoringEvent]);

  // 2. Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit(); // Auto submit when time expires
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 3. Answer Selection & Auto-saving
  const handleSelectOption = (optionKey) => {
    const qId = currentQuestion.id;
    const nextAnswers = { ...userAnswers, [qId]: optionKey };
    setUserAnswers(nextAnswers);

    // Auto save simulation
    setIsAutoSaving(true);
    saveAnswerApi(student?.id, examMetadata.examId, qId, optionKey);
    setTimeout(() => setIsAutoSaving(false), 500);
  };

  // 4. Mark / Unmark Review
  const handleToggleReview = () => {
    const qId = currentQuestion.id;
    if (markedForReview.includes(qId)) {
      setMarkedForReview(markedForReview.filter(id => id !== qId));
    } else {
      setMarkedForReview([...markedForReview, qId]);
    }
  };

  // 5. Clear Response
  const handleClearResponse = () => {
    const qId = currentQuestion.id;
    const nextAnswers = { ...userAnswers };
    delete nextAnswers[qId];
    setUserAnswers(nextAnswers);
  };

  // 6. Navigation Handlers
  const handleNext = () => {
    if (currentIndex < sampleQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsConfirmModalOpen(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // 7. Final Submission Execution
  const handleFinalSubmit = () => {
    // Stop monitors before transition
    if (browserMonitorRef.current) browserMonitorRef.current.stop();
    if (appMonitorRef.current) appMonitorRef.current.stop();

    const summary = {
      totalQuestions: sampleQuestions.length,
      answeredCount: Object.keys(userAnswers).length,
      unansweredCount: sampleQuestions.length - Object.keys(userAnswers).length,
      markedReviewCount: markedForReview.length,
      timeSpentSeconds: (examMetadata.durationMinutes * 60) - secondsLeft
    };

    onFinishSubmission({
      student,
      userAnswers,
      summary,
      submittedAt: new Date().toISOString()
    });
  };

  // 8. Demo Simulator for Hackathon Judges
  const handleSimulateAppSwitchDemo = () => {
    if (appMonitorRef.current) {
      appMonitorRef.current.triggerSimulatedSwitch(
        "Notepad.exe", 
        "Student switched active desktop window to unauthorized application: Notepad.exe"
      );
    }
  };

  const answeredCount = Object.keys(userAnswers).filter(k => userAnswers[k] !== null).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none">
      
      {/* 1. Distraction-Free Header */}
      <Header 
        student={student}
        secondsLeft={secondsLeft}
        answeredCount={answeredCount}
        totalQuestions={sampleQuestions.length}
        isAutoSaving={isAutoSaving}
        onRequestSubmit={() => setIsConfirmModalOpen(true)}
      />

      {/* 2. Main Examination Body */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left: Active Question Card */}
        <section className="lg:col-span-3">
          <QuestionCard 
            question={currentQuestion}
            currentIndex={currentIndex}
            totalQuestions={sampleQuestions.length}
            selectedOption={userAnswers[currentQuestion.id]}
            isMarkedForReview={markedForReview.includes(currentQuestion.id)}
            onSelectOption={handleSelectOption}
            onToggleReview={handleToggleReview}
            onClearResponse={handleClearResponse}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        </section>

        {/* Right: Question Navigation Palette */}
        <aside className="lg:col-span-1">
          <QuestionNavigation 
            totalQuestions={sampleQuestions.length}
            currentIndex={currentIndex}
            userAnswers={userAnswers}
            markedForReview={markedForReview}
            onSelectQuestion={(idx) => setCurrentIndex(idx)}
            onRequestSubmit={() => setIsConfirmModalOpen(true)}
          />
        </aside>

      </main>

      {/* 3. Dual Warning Notification Banner */}
      <WarningBanner 
        warning={activeWarning}
        onDismiss={() => setActiveWarning(null)}
      />

      {/* 4. Transparent Dual Activity Agent Status Badge */}
      <AgentStatusBadge 
        browserMonitorActive={true}
        isAgentConnected={appMonitorRef.current?.isAgentConnected || false}
        onSimulateAppSwitch={handleSimulateAppSwitchDemo}
      />

      {/* 5. Pre-Submission Confirmation Dialog */}
      {isConfirmModalOpen && (
        <SubmitConfirmModal 
          totalQuestions={sampleQuestions.length}
          answeredCount={answeredCount}
          markedCount={markedForReview.length}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleFinalSubmit}
        />
      )}

    </div>
  );
}


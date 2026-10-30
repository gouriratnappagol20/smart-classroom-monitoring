import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import QuestionCard from '../components/QuestionCard';
import QuestionNavigation from '../components/QuestionNavigation';
import WarningBanner from '../components/WarningBanner';
import SubmitConfirmModal from '../components/SubmitConfirmModal';
import AgentStatusBadge from '../components/AgentStatusBadge';
import { examMetadata } from '../data/examQuestions';
import { BrowserMonitor } from '../monitoring/browserMonitor';
import { ApplicationMonitor } from '../monitoring/applicationMonitor';
import { saveAnswerApi, submitExamApi } from '../services/api';

export default function ExaminationPage({ 
  student, 
  examData,
  onFinishSubmission, 
  onLogMonitoringEvent 
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState([]);

  // Resolve questions and metadata
  const resolvedMetadata = examData || examMetadata;
  const questionsList = Array.isArray(examData?.questions) ? examData.questions : [];

  // Normalize questions to guarantee compatibility with QuestionCard
  const normalizedQuestions = questionsList.map(q => {
    let normalizedOptions = q.options;
    if (Array.isArray(q.options) && typeof q.options[0] === 'string') {
      normalizedOptions = q.options.map(opt => {
        const match = opt.match(/^([A-D])\)\s*(.*)$/);
        if (match) {
          return { key: match[1], text: match[2] };
        }
        return { key: opt.charAt(0), text: opt.slice(2).trim() };
      });
    }
    return {
      ...q,
      marks: q.marks || 10,
      topic: q.topic || "Core Systems",
      options: normalizedOptions
    };
  });

  const durationMin = resolvedMetadata.durationMinutes || resolvedMetadata.duration || 60;
  const [secondsLeft, setSecondsLeft] = useState(durationMin * 60);
  
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [activeWarning, setActiveWarning] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Monitor References
  const browserMonitorRef = useRef(null);
  const appMonitorRef = useRef(null);

  const currentQuestion = normalizedQuestions[currentIndex] || normalizedQuestions[0];
  const targetStudentId = student?.studentId || student?.id || "STU001";
  const targetExamId = examData?.exam_id || examData?.examId || student?.examCode || resolvedMetadata.exam_id || resolvedMetadata.examId || "EXAM_101";

  // 1. Dual Activity Monitoring Setup
  useEffect(() => {
    // A. Initialize Browser Monitor (Type 1)
    const browserMonitor = new BrowserMonitor({
      studentId: targetStudentId,
      examId: targetExamId,
      onWarning: (warningData) => {
        setActiveWarning(warningData);
      },
      onEventLogged: (event) => {
        if (onLogMonitoringEvent) onLogMonitoringEvent(event);
      },
      onCommand: (command) => {
        const action = (command.action || '').toUpperCase();

        if (action === 'LOCK') {
          setIsLocked(true);
          setActiveWarning({
            category: 'PROCTOR_COMMAND',
            title: 'Examination locked by proctor',
            message: command.message || 'The proctor has locked this examination session.'
          });
        } else if (action === 'UNLOCK') {
          setIsLocked(false);
          setActiveWarning({
            category: 'PROCTOR_COMMAND',
            title: 'Examination unlocked',
            message: command.message || 'The proctor has unlocked this examination session.'
          });
        }
      }
    });

    browserMonitor.start();
    browserMonitorRef.current = browserMonitor;

    // B. Initialize Application Monitor (Type 2)
    const appMonitor = new ApplicationMonitor({
      studentId: targetStudentId,
      examId: targetExamId,
      onWarning: (warningData) => {
        setActiveWarning(warningData);
      },
      onEventLogged: (event) => {
        if (onLogMonitoringEvent) onLogMonitoringEvent(event);
      }
    });

    appMonitor.start();
    appMonitorRef.current = appMonitor;

    // Cleanup when exam unmounts
    return () => {
      browserMonitor.stop();
      appMonitor.stop();
    };
  }, [targetStudentId, targetExamId, onLogMonitoringEvent]);

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

  // 3. Answer Selection & Actual SQLite Persistence
  const handleSelectOption = (optionKey) => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;
    const nextAnswers = { ...userAnswers, [qId]: optionKey };
    setUserAnswers(nextAnswers);

    setIsAutoSaving(true);
    setSaveError(false);

    saveAnswerApi(targetStudentId, targetExamId, qId, optionKey)
      .then(() => {
        setIsAutoSaving(false);
        setSaveError(false);
      })
      .catch((err) => {
        console.error("[SENTINEL] Auto-save API failed:", err);
        setIsAutoSaving(false);
        setSaveError(true);
      });
  };

  // 4. Mark / Unmark Review
  const handleToggleReview = () => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;
    if (markedForReview.includes(qId)) {
      setMarkedForReview(markedForReview.filter(id => id !== qId));
    } else {
      setMarkedForReview([...markedForReview, qId]);
    }
  };

  // 5. Clear Response
  const handleClearResponse = () => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;
    const nextAnswers = { ...userAnswers };
    delete nextAnswers[qId];
    setUserAnswers(nextAnswers);
  };

  // 6. Navigation Handlers
  const handleNext = () => {
    if (currentIndex < normalizedQuestions.length - 1) {
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
  const handleFinalSubmit = async () => {
    // Stop monitors before transition
    if (browserMonitorRef.current) browserMonitorRef.current.stop();
    if (appMonitorRef.current) appMonitorRef.current.stop();

    const summary = {
      totalQuestions: normalizedQuestions.length,
      answeredCount: Object.keys(userAnswers).length,
      unansweredCount: normalizedQuestions.length - Object.keys(userAnswers).length,
      markedReviewCount: markedForReview.length,
      timeSpentSeconds: (durationMin * 60) - secondsLeft
    };

    let referenceId = null;
    try {
      const submitRes = await submitExamApi(targetStudentId, targetExamId, userAnswers, summary);
      if (submitRes && submitRes.reference_id) {
        referenceId = submitRes.reference_id;
      }
    } catch (err) {
      console.error("[SENTINEL] Exam submission API error:", err);
    }

    onFinishSubmission({
      student,
      userAnswers,
      summary,
      referenceId,
      submittedAt: new Date().toISOString()
    });
  };

  // Desktop application monitoring is performed by the visible Python agent.
  const handleSimulateAppSwitchDemo = () => {
    setActiveWarning({
      category: 'SYSTEM_INFO',
      title: 'Desktop monitoring uses the Python agent',
      message: 'Start monitoring-agent/agent.py on this computer to enable real application detection and screen sharing.'
    });
  };
  const answeredCount = Object.keys(userAnswers).filter(k => userAnswers[k] !== null && userAnswers[k] !== undefined).length;

  if (normalizedQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md rounded-xl bg-white border p-6 text-center">
          <h2 className="font-bold text-slate-800">Exam data unavailable</h2>
          <p className="text-sm text-slate-500 mt-2">
            The examination could not be loaded from the backend. Return to the portal and retry.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none">
      {isLocked && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 flex items-center justify-center p-6">
          <div className="max-w-md text-center text-white">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold">Examination Locked</h2>
            <p className="text-slate-300 text-sm mt-3">
              Your examination interface has been locked by the proctor.
              Please wait for the proctor to unlock your session.
            </p>
          </div>
        </div>
      )}
      
      {/* 1. Distraction-Free Header */}
      <Header 
        student={student}
        secondsLeft={secondsLeft}
        answeredCount={answeredCount}
        totalQuestions={normalizedQuestions.length}
        isAutoSaving={isAutoSaving}
        saveError={saveError}
        onRequestSubmit={() => setIsConfirmModalOpen(true)}
      />

      {/* 2. Main Examination Body */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left: Active Question Card */}
        <section className="lg:col-span-3">
          <QuestionCard 
            question={currentQuestion}
            currentIndex={currentIndex}
            totalQuestions={normalizedQuestions.length}
            selectedOption={userAnswers[currentQuestion?.id]}
            isMarkedForReview={markedForReview.includes(currentQuestion?.id)}
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
            totalQuestions={normalizedQuestions.length}
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
          totalQuestions={normalizedQuestions.length}
          answeredCount={answeredCount}
          markedCount={markedForReview.length}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleFinalSubmit}
        />
      )}

    </div>
  );
}


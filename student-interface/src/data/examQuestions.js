export const examMetadata = {
  examId: "EXAM_101",
  examTitle: "CS401: Advanced Operating Systems Final Examination",
  department: "Department of Computer Science & Engineering",
  courseCode: "CS-401",
  durationMinutes: 60,
  totalQuestions: 4,
  totalMarks: 40,
  passingMarks: 50,
  instructions: [
    "Ensure you are seated in an authorized examination environment with dual activity monitoring active.",
    "Do NOT switch browser tabs or minimize the examination window. Browser switching is monitored in real time.",
    "Do NOT launch or switch to unauthorized operating-system applications (Notepad, Calculator, Chrome, IDEs, etc.).",
    "Answers are saved automatically upon selection. You can revisit and alter responses prior to final submission.",
    "Use the Question Navigation Panel on the right to flag questions for review or quickly jump between sections.",
    "Once the final 'Submit Examination' button is clicked and confirmed, your session is permanently closed."
  ]
};

export const sampleQuestions = [
  {
    id: 1,
    marks: 10,
    topic: "Process Architecture",
    question: "What is the primary architectural difference between a process and a thread?",
    options: [
      { key: "A", text: "Threads share the virtual address space and heap of their parent process." },
      { key: "B", text: "Processes share memory by default without IPC mechanisms." },
      { key: "C", text: "Threads cannot be individually scheduled across multiple CPU cores." },
      { key: "D", text: "Context switching between processes has lower overhead than threads." }
    ],
    correctOption: "A"
  },
  {
    id: 2,
    marks: 10,
    topic: "Process Concurrency",
    question: "Which synchronization primitive prevents race conditions by permitting only one execution thread inside a critical section?",
    options: [
      { key: "A", text: "Counting Semaphore" },
      { key: "B", text: "Mutex (Mutual Exclusion Lock)" },
      { key: "C", text: "Barrier" },
      { key: "D", text: "Read-Write Spinlock" }
    ],
    correctOption: "B"
  },
  {
    id: 3,
    marks: 10,
    topic: "Virtual Memory & Paging",
    question: "In virtual memory management, which condition triggers a Page Fault interrupt?",
    options: [
      { key: "A", text: "CPU instruction cache miss during execution." },
      { key: "B", text: "An attempt to access a virtual page whose Present/Valid bit in the page table is 0." },
      { key: "C", text: "High disk I/O throughput preventing kernel DMA writes." },
      { key: "D", text: "Direct access of hardware BIOS interrupt table." }
    ],
    correctOption: "B"
  },
  {
    id: 4,
    marks: 10,
    topic: "CPU Scheduling",
    question: "Which CPU scheduling algorithm is guaranteed to minimize average waiting time for a given set of stationary processes?",
    options: [
      { key: "A", text: "First-Come, First-Served (FCFS)" },
      { key: "B", text: "Round Robin (RR) with 10ms quantum" },
      { key: "C", text: "Shortest Job First (SJF) / Shortest Remaining Time First" },
      { key: "D", text: "Multilevel Feedback Queue (MLFQ)" }
    ],
    correctOption: "C"
  }
];

export const preconfiguredStudents = [
  {
    id: "PC-01",
    studentId: "STU001",
    name: "Alice Johnson",
    rollNumber: "CS24-1001",
    seat: "Station A-01",
    examCode: "EXAM_101"
  },
  {
    id: "PC-02",
    studentId: "STU002",
    name: "Bob Smith",
    rollNumber: "CS24-1002",
    seat: "Station A-02",
    examCode: "EXAM_101"
  },
  {
    id: "PC-03",
    studentId: "STU003",
    name: "Charlie Davis",
    rollNumber: "CS24-1003",
    seat: "Station A-03",
    examCode: "EXAM_101"
  }
];

export const examMetadata = {
  examId: "CS-301-MIDTERM",
  examTitle: "CS-301: Advanced Systems Programming Midterm",
  department: "Department of Computer Science & Engineering",
  courseCode: "CS-301",
  durationMinutes: 120,
  totalQuestions: 10,
  totalMarks: 100,
  passingMarks: 70,
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
    topic: "Balanced Search Trees",
    question: "In a Red-Black Tree, what is the maximum possible height of a tree containing n internal nodes?",
    options: [
      { key: "A", text: "2 * log2(n + 1)" },
      { key: "B", text: "log2(n) + 1" },
      { key: "C", text: "n / 2" },
      { key: "D", text: "1.44 * log2(n)" }
    ],
    correctOption: "A"
  },
  {
    id: 2,
    marks: 10,
    topic: "Pointer Arithmetic & C Memory",
    question: "Consider the C declaration:\n\nint arr[5] = {10, 20, 30, 40, 50};\nint *ptr = arr;\n*(ptr + 3) += 5;\n\nWhat is the value of arr[3] after execution?",
    options: [
      { key: "A", text: "40" },
      { key: "B", text: "45" },
      { key: "C", text: "35" },
      { key: "D", text: "50" }
    ],
    correctOption: "B"
  },
  {
    id: 3,
    marks: 10,
    topic: "Process Concurrency",
    question: "Which POSIX synchronization primitive is best suited for coordinating access to a critical section between multiple reader threads and an exclusive writer thread?",
    options: [
      { key: "A", text: "Binary Semaphore" },
      { key: "B", text: "pthread_rwlock_t (Read-Write Lock)" },
      { key: "C", text: "Spinlock" },
      { key: "D", text: "Counting Semaphore with limit 1" }
    ],
    correctOption: "B"
  },
  {
    id: 4,
    marks: 10,
    topic: "Virtual Memory & Paging",
    question: "In a 32-bit virtual addressing system with 4 KB page sizes, how many bits are reserved for the page offset within a frame?",
    options: [
      { key: "A", text: "10 bits" },
      { key: "B", text: "12 bits (2^12 = 4096 bytes)" },
      { key: "C", text: "14 bits" },
      { key: "D", text: "16 bits" }
    ],
    correctOption: "B"
  },
  {
    id: 5,
    marks: 10,
    topic: "UNIX System Calls",
    question: "What does the fork() system call return to the newly created child process upon successful creation?",
    options: [
      { key: "A", text: "0" },
      { key: "B", text: "The Process ID (PID) of the parent" },
      { key: "C", text: "A positive integer equal to child's PID" },
      { key: "D", text: "-1" }
    ],
    correctOption: "A"
  },
  {
    id: 6,
    marks: 10,
    topic: "Dynamic Memory Management",
    question: "Which of the following functions in the C standard library reallocates previously allocated heap memory without zeroing the newly extended bytes?",
    options: [
      { key: "A", text: "calloc()" },
      { key: "B", text: "realloc()" },
      { key: "C", text: "malloc()" },
      { key: "D", text: "sbrk()" }
    ],
    correctOption: "B"
  },
  {
    id: 7,
    marks: 10,
    topic: "Deadlock Invariants",
    question: "Which of the following conditions is NOT one of the four Coffman conditions necessary for a system deadlock to occur?",
    options: [
      { key: "A", text: "Mutual Exclusion" },
      { key: "B", text: "Hold and Wait" },
      { key: "C", text: "Preemption allowed by kernel" },
      { key: "D", text: "Circular Wait" }
    ],
    correctOption: "C"
  },
  {
    id: 8,
    marks: 10,
    topic: "Signal Handling",
    question: "Which POSIX signal cannot be caught, blocked, or ignored by a user-space application handler?",
    options: [
      { key: "A", text: "SIGINT" },
      { key: "B", text: "SIGTERM" },
      { key: "C", text: "SIGKILL" },
      { key: "D", text: "SIGSEGV" }
    ],
    correctOption: "C"
  },
  {
    id: 9,
    marks: 10,
    topic: "CPU Scheduling",
    question: "Which CPU scheduling algorithm guarantees minimal average waiting time for a set of stationary processes arriving simultaneously?",
    options: [
      { key: "A", text: "First-Come, First-Served (FCFS)" },
      { key: "B", text: "Shortest Job First (SJF / SJN)" },
      { key: "C", text: "Round Robin with large quantum" },
      { key: "D", text: "Priority Scheduling without aging" }
    ],
    correctOption: "B"
  },
  {
    id: 10,
    marks: 10,
    topic: "File Systems & I/O",
    question: "In UNIX file system architecture, which data structure stores metadata about a file (permissions, owner, block pointers) but NOT the filename itself?",
    options: [
      { key: "A", text: "Directory Entry (dirent)" },
      { key: "B", text: "Inode (Index Node)" },
      { key: "C", text: "Superblock" },
      { key: "D", text: "File Allocation Table" }
    ],
    correctOption: "B"
  }
];

export const preconfiguredStudents = [
  {
    id: "PC-01",
    studentId: "STU-1048",
    name: "Sarah Jenkins",
    rollNumber: "CS24-1048",
    seat: "Station A-01",
    examCode: "CS-301-MIDTERM"
  },
  {
    id: "PC-02",
    studentId: "STU-1092",
    name: "David Miller",
    rollNumber: "CS24-1092",
    seat: "Station A-02",
    examCode: "CS-301-MIDTERM"
  },
  {
    id: "PC-03",
    studentId: "STU-1115",
    name: "Marcus Vance",
    rollNumber: "CS24-1115",
    seat: "Station A-03",
    examCode: "CS-301-MIDTERM"
  }
];


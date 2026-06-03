export const currentUser = {
  name: "Vamsi Krishna",
  handle: "u/vamsi",
  role: "Student",
  sp: 220,
  avatar: "VK",
};

export const suggestions = [
  {
    id: "s1",
    question: "What are the timings for the campus library?",
    answer:
      "The Central Library is open Mon–Sat 8:00 AM to 10:00 PM, and Sun 10:00 AM to 6:00 PM. The 24/7 Reading Hall (Block C) is always open with a valid ID swipe.",
    match: 95,
    upvotes: 184,
    answeredBy: { name: "Dr. Rao", role: "Mentor" },
  },
  {
    id: "s2",
    question: "Library timings during exam week?",
    answer: "During mid-sem and end-sem weeks the main library extends to 12:00 AM.",
    match: 82,
    upvotes: 64,
    answeredBy: { name: "Admin Office", role: "Admin" },
  },
  {
    id: "s3",
    question: "How late can I stay in the reading hall?",
    answer: "Block C reading hall is open 24/7 with biometric access.",
    match: 60,
    upvotes: 31,
    answeredBy: { name: "u/anita", role: "Student" },
  },
];

export const threads = [
  {
    id: "t1",
    title: "Best electives for CSE third year if I want to specialize in ML?",
    preview:
      "I'm choosing between Reinforcement Learning, Computer Vision, and Distributed Systems. Looking for honest takes from seniors who've actually taken these.",
    author: { name: "u/devansh", role: "Student" },
    upvotes: 142,
    comments: 38,
    tag: "Academics",
    age: "2h",
    verified: true,
  },
  {
    id: "t2",
    title: "Hostel mess timings changed again — official notice?",
    preview: "Mess closed at 9:15 today but the notice says 9:45. Anyone else?",
    author: { name: "u/priya", role: "Student" },
    upvotes: 89,
    comments: 24,
    tag: "Hostel",
    age: "5h",
  },
  {
    id: "t3",
    title: "Internship reimbursement process — step by step",
    preview: "Posting this so nobody else has to run between 4 offices like I did.",
    author: { name: "Prof. Iyer", role: "Mentor" },
    upvotes: 312,
    comments: 71,
    tag: "Placements",
    age: "1d",
    verified: true,
  },
  {
    id: "t4",
    title: "Lost ID card near Block B — how to get a replacement fast?",
    preview: "Need it by tomorrow for an exam. Any shortcut?",
    author: { name: "u/karthik", role: "Student" },
    upvotes: 12,
    comments: 0,
    tag: "Admin",
    age: "30m",
    unanswered: true,
  },
  {
    id: "t5",
    title: "Workshop on Quantum Computing this Friday — worth attending?",
    preview: "Anyone been to the prior sessions? Is it intro-level or research-grade?",
    author: { name: "u/sneha", role: "Student" },
    upvotes: 47,
    comments: 9,
    tag: "Events",
    age: "8h",
  },
];

export const personalTickets = [
  {
    id: "tk1",
    subject: "Fee receipt missing from portal",
    body: "Roll no 21BCS1043 — paid on Nov 14, receipt not generated.",
    user: "u/arjun",
    age: "12m",
    severity: "medium",
  },
  {
    id: "tk2",
    subject: "Scholarship disbursement delay",
    body: "Bank account: ****7821, last credit was August.",
    user: "u/maya",
    age: "1h",
    severity: "high",
  },
];

export const flagged = [
  {
    id: "f1",
    subject: "Toxic reply on thread #t12",
    body: "Repeated personal attacks against u/sneha.",
    user: "u/troll99",
    age: "20m",
    severity: "high",
  },
];

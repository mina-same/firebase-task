/**
 * Mock Data for Development
 * 
 * Provides fake data for testing the application without Firebase
 * This allows developers to work on the UI/UX without database setup
 * 
 * @module data/mockData
 */

/**
 * Mock feedback data
 * Simulates employee feedback records from Firestore
 */
export const mockFeedback = [
  {
    id: 'feedback_1',
    date: new Date('2024-07-26T10:30:00'),
    employeeName: 'Alice Johnson',
    score: 5,
    notes: 'Exceptional performance on the recent project. Showed great leadership and problem-solving skills.',
  },
  {
    id: 'feedback_2',
    date: new Date('2024-07-25T14:20:00'),
    employeeName: 'Bob Smith',
    score: 4,
    notes: 'Consistently meets expectations. Good team player and reliable.',
  },
  {
    id: 'feedback_3',
    date: new Date('2024-07-24T09:15:00'),
    employeeName: 'Carol Williams',
    score: 3,
    notes: 'Needs improvement in communication. Technical skills are strong but needs to work on expressing ideas clearly.',
  },
  {
    id: 'feedback_4',
    date: new Date('2024-07-23T16:45:00'),
    employeeName: 'David Brown',
    score: 5,
    notes: 'Outstanding work ethic and dedication. A valuable asset to the team.',
  },
  {
    id: 'feedback_5',
    date: new Date('2024-07-22T11:30:00'),
    employeeName: 'Emma Davis',
    score: 4,
    notes: 'Good performance overall. Creative and detail-oriented.',
  },
  {
    id: 'feedback_6',
    date: new Date('2024-07-21T13:00:00'),
    employeeName: 'Alice Johnson',
    score: 5,
    notes: 'Continues to exceed expectations. Excellent leadership on Q4 project.',
  },
  {
    id: 'feedback_7',
    date: new Date('2024-07-20T10:00:00'),
    employeeName: 'Bob Smith',
    score: 3,
    notes: 'Good technical skills but needs better documentation practices.',
  },
  {
    id: 'feedback_8',
    date: new Date('2024-07-19T15:30:00'),
    employeeName: 'Carol Williams',
    score: 4,
    notes: 'Showing improvement in communication. Keep up the good work.',
  },
  {
    id: 'feedback_9',
    date: new Date('2024-07-18T09:45:00'),
    employeeName: 'David Brown',
    score: 5,
    notes: 'Consistently delivers high-quality work. Great team contributor.',
  },
  {
    id: 'feedback_10',
    date: new Date('2024-07-17T14:15:00'),
    employeeName: 'Emma Davis',
    score: 4,
    notes: 'Solid performance on mobile app redesign. Good attention to detail.',
  },
];

/**
 * Mock conversations data
 * Simulates chat conversations from Firestore
 */
export const mockConversations = [
  {
    id: 'emp_alice_johnson',
    participantNames: ['Sarah Connor (HR)', 'Alice Johnson'],
    lastMessage: 'Thank you for the feedback! I really appreciate it.',
    lastMessageTimestamp: new Date('2025-10-28T14:30:00'),
  },
  {
    id: 'emp_bob_smith',
    participantNames: ['Sarah Connor (HR)', 'Bob Smith'],
    lastMessage: 'I will work on improving my documentation.',
    lastMessageTimestamp: new Date('2025-10-27T16:45:00'),
  },
  {
    id: 'emp_carol_williams',
    participantNames: ['Sarah Connor (HR)', 'Carol Williams'],
    lastMessage: 'Can we schedule a meeting to discuss my performance?',
    lastMessageTimestamp: new Date('2025-10-26T11:20:00'),
  },
  {
    id: 'emp_david_brown',
    participantNames: ['Sarah Connor (HR)', 'David Brown'],
    lastMessage: 'Thanks! Happy to help the team.',
    lastMessageTimestamp: new Date('2025-10-25T17:00:00'),
  },
  {
    id: 'emp_emma_davis',
    participantNames: ['Sarah Connor (HR)', 'Emma Davis'],
    lastMessage: 'The mobile app redesign is progressing well.',
    lastMessageTimestamp: new Date('2025-10-24T15:30:00'),
  },
];

/**
 * Mock messages data
 * Simulates chat messages from Firestore (grouped by conversation)
 */
export const mockMessages = {
  'emp_alice_johnson': [
    {
      id: 'msg_1',
      senderId: 'hr_sconnor',
      text: 'Hi Alice! Great job on the Q4 project. Your leadership was exceptional!',
      timestamp: new Date('2025-10-28T14:00:00'),
    },
    {
      id: 'msg_2',
      senderId: 'emp_alice_johnson',
      text: 'Thank you so much! The team worked really hard.',
      timestamp: new Date('2025-10-28T14:15:00'),
    },
    {
      id: 'msg_3',
      senderId: 'hr_sconnor',
      text: 'Your innovative approach to problem-solving stood out. Keep it up!',
      timestamp: new Date('2025-10-28T14:20:00'),
    },
    {
      id: 'msg_4',
      senderId: 'emp_alice_johnson',
      text: 'Thank you for the feedback! I really appreciate it.',
      timestamp: new Date('2025-10-28T14:30:00'),
    },
  ],
  'emp_bob_smith': [
    {
      id: 'msg_5',
      senderId: 'hr_sconnor',
      text: 'Hi Bob, I wanted to discuss your recent performance review.',
      timestamp: new Date('2025-10-27T16:00:00'),
    },
    {
      id: 'msg_6',
      senderId: 'emp_bob_smith',
      text: 'Sure, I saw the feedback about documentation.',
      timestamp: new Date('2025-10-27T16:30:00'),
    },
    {
      id: 'msg_7',
      senderId: 'hr_sconnor',
      text: 'Yes, your presentations are great, but we need better code documentation.',
      timestamp: new Date('2025-10-27T16:35:00'),
    },
    {
      id: 'msg_8',
      senderId: 'emp_bob_smith',
      text: 'I will work on improving my documentation.',
      timestamp: new Date('2025-10-27T16:45:00'),
    },
  ]
};

/**
 * Helper function to simulate delay (like network request)
 * 
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after delay
 */
export const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));


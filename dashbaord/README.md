# HR Feedback Admin Panel

A comprehensive HR feedback management system built with React, Firebase, and real-time messaging capabilities.

## 🚀 Features

### Dashboard
- **Real-time Feedback Display**: View all employee feedback in a sortable, searchable table
- **Score Analytics**: Interactive pie chart showing score distribution (1-5 stars)
- **Live Updates**: Automatic updates when new feedback is added
- **Search & Filter**: Search feedback by employee name or notes content
- **Sorting**: Sort by date, employee name, or score

### Chat System
- **Real-time Messaging**: One-on-one chat with employees
- **Message History**: Persistent conversation history
- **Employee List**: Browse and select employees to chat with
- **Live Sync**: Messages appear instantly without page refresh
- **Professional UI**: Clean, modern chat interface

## 🛠️ Tech Stack

- **Frontend**: React 18+ with Hooks
- **Routing**: React Router v6
- **Styling**: Tailwind CSS + CSS Modules
- **Database**: Firebase Firestore (Real-time)
- **Charts**: Recharts
- **Build Tool**: Vite
- **Icons**: React Icons
- **Date Handling**: date-fns

## 📋 Prerequisites

- Node.js 20.19+ or 22.12+ (required for Vite 7)
- npm or yarn
- Firebase account and project

## 🔧 Installation

1. **Clone the repository**
   ```bash
   cd dashbaord
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   
   Copy `.env.example` to `.env` and add your Firebase credentials:
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your Firebase project credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Set up Firestore Database**
   
   Create the following collections in Firebase:
   - `feedback` - Stores employee feedback
   - `conversations` - Stores chat conversations
   - `messages` - Subcollection under conversations

## 🚀 Running the Application

### Development Mode with Mock Data (No Firebase Required!)

The application is **pre-configured to use mock data** so you can test it immediately without Firebase setup:

```bash
# Using nvm
nvm use 22
npm run dev

# Or using the helper script
./run-dev.sh
```

The application will start at `http://localhost:5173` with **fake data** already loaded!

### Switching to Real Firebase Data

When you're ready to connect to Firebase:

1. **Update your `.env` file** with real Firebase credentials
2. **Edit these two files** and uncomment the real Firebase imports:
   - `src/pages/Dashboard/Dashboard.jsx` (line 11-12)
   - `src/pages/Chat/Chat.jsx` (line 11-14)

```javascript
// Change from:
import useFeedback from '../../hooks/useMockFeedback';

// To:
import useFeedback from '../../hooks/useFeedback';
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📁 Project Structure

```
dashbaord/
├── src/
│   ├── assets/              # Static assets
│   ├── components/          # Reusable components
│   │   ├── common/         # Shared components (Button, Input, Loading, etc.)
│   │   ├── layout/         # Layout components (Header, Sidebar, MainLayout)
│   │   ├── dashboard/      # Dashboard-specific components
│   │   └── chat/           # Chat-specific components
│   ├── config/             # Configuration files
│   │   ├── firebase.config.js  # Firebase initialization
│   │   └── constants.js        # App constants
│   ├── context/            # React Context providers
│   ├── hooks/              # Custom React hooks
│   │   ├── useFeedback.js  # Feedback data management
│   │   ├── useChat.js      # Chat functionality
│   │   └── useRealtime.js  # Generic real-time listeners
│   ├── pages/              # Page components
│   │   ├── Dashboard/      # Dashboard page
│   │   ├── Chat/           # Chat page
│   │   └── NotFound/       # 404 page
│   ├── services/           # Business logic & Firebase operations
│   │   ├── firestoreService.js  # Generic Firestore operations
│   │   ├── feedbackService.js   # Feedback CRUD
│   │   └── chatService.js       # Chat operations
│   ├── styles/             # Global styles
│   ├── utils/              # Utility functions
│   │   ├── dateFormatter.js
│   │   ├── validators.js
│   │   └── helpers.js
│   ├── App.jsx             # Root component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── public/                 # Public assets
├── .env                    # Environment variables
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🎭 Mock Data for Development

The application includes **comprehensive mock data** so you can test all features without Firebase:

### Mock Data Includes:
- ✅ **10 Feedback Records** - Various employees with different scores (1-5)
- ✅ **5 Chat Conversations** - Pre-populated conversations with employees
- ✅ **20+ Chat Messages** - Full message history for each conversation
- ✅ **Realistic Data** - Names, dates, and content that mimics production

### Mock Data Files:
- `src/data/mockData.js` - All mock data definitions
- `src/hooks/useMockFeedback.js` - Mock feedback hook
- `src/hooks/useMockChat.js` - Mock chat hook

### Testing Features:
1. **Dashboard** - View feedback table with sorting and search
2. **Score Chart** - See pie chart with score distribution
3. **Chat** - Send and receive messages (simulated)
4. **Real-time Feel** - Includes loading states and delays

**Switch to real Firebase data anytime** by changing the imports in Dashboard and Chat pages!

---

## 🎨 Features & Best Practices

### Code Quality
- ✅ **JSDoc Comments**: Comprehensive documentation for all functions
- ✅ **PropTypes**: Type checking for all components
- ✅ **Error Boundaries**: Graceful error handling
- ✅ **Custom Hooks**: Reusable logic extraction
- ✅ **Service Layer**: Separation of concerns

### React Best Practices
- ✅ **Functional Components**: Modern React with Hooks
- ✅ **Performance Optimization**: useMemo, useCallback
- ✅ **Real-time Updates**: Firebase onSnapshot listeners
- ✅ **Clean Code**: DRY principles, single responsibility

### UI/UX
- ✅ **Responsive Design**: Mobile-first approach
- ✅ **Loading States**: User feedback during operations
- ✅ **Error Handling**: User-friendly error messages
- ✅ **Accessibility**: ARIA labels, semantic HTML
- ✅ **Professional Styling**: Modern, clean interface

## 🔥 Firebase Configuration

### Firestore Collections

#### `feedback` Collection
```javascript
{
  id: "auto-generated",
  date: Timestamp,
  employeeName: "Jane Doe",
  score: 1-5,
  notes: "Feedback text..."
}
```

#### `conversations` Collection
```javascript
{
  id: "emp_jane_doe",
  participantNames: ["HR Personnel", "Jane Doe"],
  lastMessage: "Last message preview...",
  lastMessageTimestamp: Timestamp
}
```

#### `messages` Subcollection (under conversations)
```javascript
{
  id: "auto-generated",
  senderId: "hr_sconnor" | "emp_jane_doe",
  text: "Message content",
  timestamp: Timestamp
}
```

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🐛 Troubleshooting

### Node Version Error
If you see "Vite requires Node.js version 20.19+ or 22.12+":
```bash
# Using Homebrew
export PATH="/usr/local/opt/node@22/bin:$PATH"
npm run dev

# Or using nvm
nvm install 22
nvm use 22
npm run dev
```

### Firebase Connection Issues
1. Verify your `.env` file has correct credentials
2. Check Firebase console for security rules
3. Ensure Firestore is enabled in your Firebase project

## 📄 License

This project is part of a coding challenge assessment.

## 👨‍💻 Author

Built with ❤️ following professional development best practices.

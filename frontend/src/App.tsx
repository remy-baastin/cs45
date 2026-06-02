import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Faqs from './pages/Faqs';
import Questions from './pages/Questions';
import QuestionDetails from './pages/QuestionDetails';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import { useAuthStore } from './store/useAuthStore';
import { useEffect } from 'react';
import { apiClient } from './services/api';

function App() {
  const { setUser, token, logout } = useAuthStore();

  useEffect(() => {
    if (token) {
      apiClient.get('/auth/me')
        .then(res => setUser(res.data))
        .catch(() => {
          logout();
        });
    }
  }, [token, setUser, logout]);

  return (
    <Router>
      <Box minH="100vh">
        <Navbar />
        <Box as="main" p={4}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/faqs" element={<Faqs />} />
            <Route path="/questions" element={<Questions />} />
            <Route path="/questions/:id" element={<QuestionDetails />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;

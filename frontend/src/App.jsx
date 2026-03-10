import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CourseProvider } from './contexts/CourseContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import AuthPage from './pages/AuthPage';
import CourseVideoPage from './pages/CourseVideoPage';
import MyCourses from './pages/MyCourses';
import ProfilePage from './pages/ProfilePage';
import CourseDetailsPage from './pages/CourseDetailsPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Footer from './components/Footer';
import AIChatWidget from './components/AIChatWidget';
import './index.css';
import { AnimatePresence, motion } from 'framer-motion';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/auth" />;

  return children;
};

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CourseProvider>
          <Router>
            <div className="app" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <AnimatePresence mode="wait">
                  <Routes>
                    <Route path="/" element={<PageTransition><Dashboard /></PageTransition>} />
                    <Route path="/courses" element={<PageTransition><Courses /></PageTransition>} />
                    <Route path="/auth" element={<PageTransition><AuthPage /></PageTransition>} />
                    <Route path="/reset-password/:token" element={<PageTransition><ResetPasswordPage /></PageTransition>} />
                    <Route path="/course/:id" element={<PageTransition><CourseDetailsPage /></PageTransition>} />
                    <Route
                      path="/learn/:id"
                      element={
                        <ProtectedRoute>
                          <PageTransition><CourseVideoPage /></PageTransition>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/my-courses"
                      element={
                        <ProtectedRoute>
                          <PageTransition><MyCourses /></PageTransition>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <PageTransition><ProfilePage /></PageTransition>
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </AnimatePresence>
              </main>
              <Footer />
            </div>
          </Router>
        </CourseProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

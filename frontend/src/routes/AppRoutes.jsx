import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppShell } from '../components/layout/AppShell';

// Auth Pages
import { Login } from '../pages/auth/Login';
import { StudentRegister } from '../pages/auth/StudentRegister';
import { AdminLogin } from '../pages/auth/AdminLogin';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { ResetPassword } from '../pages/auth/ResetPassword';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { UsersPage } from '../pages/admin/UsersPage';
import { UserDetailsPage } from '../pages/admin/UserDetailsPage';
import { QuizzesPage } from '../pages/admin/QuizzesPage';
import { CreateQuizPage } from '../pages/admin/CreateQuizPage';
import { EditQuizPage } from '../pages/admin/EditQuizPage';
import { QuestionsPage } from '../pages/admin/QuestionsPage';
import { CategoriesPage } from '../pages/admin/CategoriesPage';
import { AttemptsPage } from '../pages/admin/AttemptsPage';
import { AttemptDetailsPage } from '../pages/admin/AttemptDetailsPage';
import { AnalyticsPage } from '../pages/admin/AnalyticsPage';
import { AdminLeaderboardPage } from '../pages/admin/AdminLeaderboardPage';
import { ProfilePage as AdminProfilePage } from '../pages/admin/ProfilePage';
import { SettingsPage as AdminSettingsPage } from '../pages/admin/SettingsPage';

// Student Pages
import { StudentDashboard } from '../pages/student/StudentDashboard';
import { QuizDiscoveryPage } from '../pages/student/QuizDiscoveryPage';
import { QuizDetailsPage } from '../pages/student/QuizDetailsPage';
import { QuizAttemptPage } from '../pages/student/QuizAttemptPage';
import { QuizResultPage } from '../pages/student/QuizResultPage';
import { AttemptHistoryPage } from '../pages/student/AttemptHistoryPage';
import { StudentLeaderboardPage } from '../pages/student/StudentLeaderboardPage';
import { ProfilePage as StudentProfilePage } from '../pages/admin/ProfilePage';
import { SettingsPage as StudentSettingsPage } from '../pages/admin/SettingsPage';

// Route Guards
import { AdminRoute, StudentRoute } from './ProtectedRoute';

const RootRedirect = () => {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Root Redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Auth Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<StudentRegister />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Admin Protected Routes */}
      <Route element={<AdminRoute />}>
        <Route element={<AppShell />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/admin/users/:id" element={<UserDetailsPage />} />
          <Route path="/admin/quizzes" element={<QuizzesPage />} />
          <Route path="/admin/quizzes/create" element={<CreateQuizPage />} />
          <Route path="/admin/quizzes/:id/edit" element={<EditQuizPage />} />
          <Route path="/admin/quizzes/:id/questions" element={<QuestionsPage />} />
          <Route path="/admin/categories" element={<CategoriesPage />} />
          <Route path="/admin/attempts" element={<AttemptsPage />} />
          <Route path="/admin/attempts/:id" element={<AttemptDetailsPage />} />
          <Route path="/admin/analytics" element={<AnalyticsPage />} />
          <Route path="/admin/leaderboard" element={<AdminLeaderboardPage />} />
          <Route path="/admin/profile" element={<AdminProfilePage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
        </Route>
      </Route>

      {/* Student Protected Routes */}
      <Route element={<StudentRoute />}>
        <Route element={<AppShell />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/quizzes" element={<QuizDiscoveryPage />} />
          <Route path="/student/quizzes/:id" element={<QuizDetailsPage />} />
          <Route path="/student/attempts" element={<AttemptHistoryPage />} />
          <Route path="/student/attempts/:id/result" element={<QuizResultPage />} />
          <Route path="/student/leaderboard" element={<StudentLeaderboardPage />} />
          <Route path="/student/profile" element={<StudentProfilePage />} />
          <Route path="/student/settings" element={<StudentSettingsPage />} />
        </Route>

        {/* Fullscreen Attempt Screen without AppShell */}
        <Route path="/student/quizzes/:id/attempt" element={<QuizAttemptPage />} />
      </Route>

      {/* Fallback Redirect */}
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
};

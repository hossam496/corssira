import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AdminDashboard from './pages/admin/Dashboard';
import StudentsPage from './pages/admin/StudentsPage';
import TeachersPage from './pages/admin/TeachersPage';
import SubjectsPage from './pages/admin/SubjectsPage';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherStudentsPage from './pages/teacher/TeacherStudentsPage';
import TeacherSubjectsPage from './pages/teacher/TeacherSubjectsPage';
import TeacherAttendancePage from './pages/teacher/TeacherAttendancePage';
import TeacherGradesPage from './pages/teacher/TeacherGradesPage';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentSubjectsPage from './pages/student/StudentSubjectsPage';
import StudentGradesPage from './pages/student/StudentGradesPage';
import StudentAttendancePage from './pages/student/StudentAttendancePage';
import ProfilePage from './pages/shared/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import SplashScreen from './components/SplashScreen';
import DashboardLayout from './components/layout/DashboardLayout';
import TeacherGroupsPage from './pages/teacher/TeacherGroupsPage';
import TeacherAssignmentsPage from './pages/teacher/TeacherAssignmentsPage';
import TeacherMaterialsPage from './pages/teacher/TeacherMaterialsPage';
import StudentGroupsPage from './pages/student/StudentGroupsPage';
import TeacherExamsPage from './pages/teacher/TeacherExamsPage';
import OnlineExamPage from './pages/student/OnlineExamPage';
import StudentExamsPage from './pages/student/StudentExamsPage';
import StudentAssignmentsPage from './pages/student/StudentAssignmentsPage';
import StudentMaterialsPage from './pages/student/StudentMaterialsPage';

// Protected Route
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return <SplashScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to="/unauthorized" replace />;
  return children;
};

// Public Route (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return <SplashScreen />;
  if (isAuthenticated) {
    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    if (user?.role === 'teacher') return <Navigate to="/teacher" replace />;
    return <Navigate to="/student" replace />;
  }
  return children;
};

function App() {
  const { theme } = useTheme();

  return (
    <div data-theme={theme}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            fontFamily: 'Cairo, sans-serif',
            direction: 'rtl',
            fontSize: '14px',
          },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin" /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="teachers" element={<TeachersPage />} />
          <Route path="subjects" element={<SubjectsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Teacher */}
        <Route path="/teacher" element={<ProtectedRoute allowedRoles={['teacher']}><DashboardLayout role="teacher" /></ProtectedRoute>}>
          <Route index element={<TeacherDashboard />} />
          <Route path="students" element={<TeacherStudentsPage />} />
          <Route path="subjects" element={<TeacherSubjectsPage />} />
          <Route path="groups" element={<TeacherGroupsPage />} />
          <Route path="attendance" element={<TeacherAttendancePage />} />
          <Route path="grades" element={<TeacherGradesPage />} />
          <Route path="exams" element={<TeacherExamsPage />} />
          <Route path="assignments" element={<TeacherAssignmentsPage />} />
          <Route path="materials" element={<TeacherMaterialsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Student */}
        <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><DashboardLayout role="student" /></ProtectedRoute>}>
          <Route index element={<StudentDashboard />} />
          <Route path="subjects" element={<StudentSubjectsPage />} />
          <Route path="groups" element={<StudentGroupsPage />} />
          <Route path="grades" element={<StudentGradesPage />} />
          <Route path="attendance" element={<StudentAttendancePage />} />
          <Route path="exams" element={<StudentExamsPage />} />
          <Route path="assignments" element={<StudentAssignmentsPage />} />
          <Route path="materials" element={<StudentMaterialsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        
        {/* Fullscreen Exam Route - Outside Dashboard Layout */}
        <Route path="/student/exam/:examId" element={<ProtectedRoute allowedRoles={['student']}><OnlineExamPage /></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import Sidebar from './components/dashboard/Sidebar';
import LecturerSidebar from './components/dashboard/LecturerSidebar';
import Dashboard from './components/manager-dashboard/Dashboard';
import Users from './components/dashboard/pages/Users';
import ClassManagement from './components/classes/Classes';
import Subjects from './components/dashboard/pages/Subjects';
import CreateSubject from './components/dashboard/pages/subject/CreateSubject';
import Syllabus from './components/dashboard/pages/Syllabus';
import Analytics from './components/analytics/Analytics';
import Settings from './components/dashboard/pages/Settings';
import ViewerPage from './pages/viewer-portal/ViewerPage';
import HomeContent from './components/Homepage/Content';
import ViewClassDetail from './pages/student-portal/ViewClassDetail';
import WeeklyTimeTable from './pages/student-portal/WeeklyTimeTable';
import AccountDetail from '../src/components/common/AccountDetail';
import AssessmentManagement from './components/assessments/Assessments'; // hoặc tên file bạn muốn 
import ViewDetailAssessment from './components/assessments/ViewDetailAssessment';
import CreateUser from './components/dashboard/pages/CreateUser';

import AboutPage from './pages/viewer-portal/AboutPage';
import NewsPage from './pages/viewer-portal/NewsPage';
// import Courses from './pages/viewer-portal/Courses';
// import Contact from './pages/viewer-portal/Contact';
import EnrollClass from './pages/student-portal/EnrollClass';
import NotFoundPage from './components/error/NotFoundPage';
import LoginPage from './pages/authentication/LoginPage';
import RegisterPage from './pages/authentication/RegisterPage';
import PaymentSuccess from './components/payment/PaymentSuccess';
import PaymentFailed from './components/payment/PaymentFailed';
import PaymentForm from './components/payment/PaymentForm';
import LecturerDashboard from './components/dashboard/pages/LecturerDashboard';
import DashboardOverview from './components/dashboard/pages/DashboardOverview';
import ClassDetail from './components/classes/detail/ClassDetail';
import LessonDetailPage from './components/classes/detail/lesson/LessonDetailPage';
import AttendancePage from './components/classes/attendance/AttendancePage';
import CheckAttendancePage from './components/classes/attendance/CheckAttendancePage';
import TeachingSchedule from './components/lecturer-portal/TeachingSchedule';
import StudentTestSchedule from './pages/student-portal/StudentTestSchedule';
import ViewTest from './pages/student-portal/ViewTest';
import TakeTest from './pages/student-portal/TakeTest';
import TestResult from './pages/student-portal/TestResult';
import SystemConfig from './components/dashboard/pages/SystemConfig';
import TestDetail from './pages/student-portal/TestDetail';
import ViewEnrolledClassDetail from './pages/student-portal/ViewEnrolledClassDetail';
import PaymentHistory from './pages/student-portal/PaymentHistory';
import PaymentDetail from './pages/student-portal/PaymentDetail';
import './App.css';
import 'antd/dist/reset.css';
import ProtectedRoute from './components/common/ProtectedRoute';
import LecturerClassList from './components/class/LecturerClassList';
import ViewClasses from './pages/viewer-portal/ViewClasses';
import ViewTestLecturer from './pages/lecturer-portal/ViewTest';
import LecturerTestDetail from './pages/lecturer-portal/LecturerTestDetail';
import GradesPage from './pages/GradesPage';
import IncomeManagement from './pages/manager-portal/IncomeManagement';
import LessonManagement from './components/dashboard/pages/LessonManagement';
import LessonDetailCreator from './components/dashboard/pages/lesson-detail/LessonDetailCreator';
import LessonDetailPreview from './components/dashboard/pages/lesson-detail/LessonDetailPreview';
import ChatBot from './components/chatbot/ChatBot';
import ThreeDHomePage from './components/dashboard/pages/ThreeDHomePage';
import ModelDetailPage from './components/dashboard/pages/3d-component/ModelDetailPage';
// import ManagerGradesPage from './pages/manager-portal/GradesPage';

const { Content } = Layout;

// Dashboard routes configuration
const dashboardRoutes = [
  { path: '/', element: <Dashboard /> },
  { path: '/users', element: <Users /> },
  { path: '/users/create', element: <CreateUser /> },
  { path: '/class', element: <ClassManagement /> },
  { path: '/class/detail', element: <ClassDetail /> },
  { path: '/subject', element: <Subjects /> },
  { path: '/subject/create', element: <CreateSubject /> },
  { path: '/syllabus', element: <Syllabus /> },
  // { path: '/blog', element: <Blog /> },
  { path: '/analytics', element: <Analytics /> },
  // { path: '/chat', element: <Chat /> },
  // { path: '/schedule', element: <Schedule /> },
  { path: '/profile', element: <AccountDetail/> },
  { path: '/profile/:accountId', element: <AccountDetail /> },
  { path: '/settings', element: <Settings /> },
  { path: '/assessment', element: <AssessmentManagement /> },
  { path: '/assessment/:testID', element: <ViewDetailAssessment /> },
  { path: '/lesson-detail' , element: <LessonDetailPage/>},
  { path: '/attendance', element: <AttendancePage/>},
  { path: '/check-attendance', element: <CheckAttendancePage /> },
  { path: '/system-config', element: <SystemConfig /> },
  { path: '/grades', element: <GradesPage /> },
  { path: '/income', element: <IncomeManagement /> },
  { path: '/lesson-management', element: <LessonManagement /> },
  { path: '/3d-model-management', element: <ThreeDHomePage /> },
  { path: '/lesson-management/create', element: <LessonDetailCreator /> },
  { path: '/lesson-management/edit/:lessonDetailId', element: <LessonDetailCreator /> },
  { path: '/lesson-management/preview/:lessonDetailId', element: <LessonDetailPreview /> },
];

// Lecturer routes configuration
const lecturerRoutes = [
  // { path: '/', element: <LecturerDashboard /> },
  { path: '/', element: <DashboardOverview /> },
  { path: '/class', element: <LecturerClassList /> },
  { path: '/class/:classId', element: <ViewEnrolledClassDetail /> },
  { path: '/check-attendance', element: <CheckAttendancePage /> },
  { path: '/schedule', element: <TeachingSchedule /> },
  // { path: '/assignments', element: <div>Assignments Page</div> },
  // { path: '/students', element: <div>Students Page</div> },
  // { path: '/messages', element: <div>Messages Page</div> },
  { path: '/profile', element: <AccountDetail/> },
  // { path: '/settings', element: <div>Settings Page</div> },
  { path: '/lesson-detail' , element: <LessonDetailPage/>},
  { path: '/attendance', element: <AttendancePage/>},
  { path: '/check-attendance', element: <CheckAttendancePage /> },
  { path: '/assessment', element: <AssessmentManagement /> },
  { path: '/assessment/:testID', element: <ViewDetailAssessment /> },
  // { path: '/attendance', element: <AttendancePage/>},
  { path: '/view-test/:testEventID', element: <ViewTestLecturer /> },
  { path: '/test-detail/:studentTestID', element: <LecturerTestDetail /> },
  { path: '/grades', element: <GradesPage /> },
  { path: '/lesson-preview/:lessonDetailId', element: <LessonDetailPreview /> },
];

// Public routes configuration
const publicRoutes = [
  { 
    // TRANG CHÍNH
    path: '/', element: <ViewerPage />,
    // TRANG NAVIGATE
    children: [
      { path: '', element: <HomeContent /> },
      { path: 'payment-success', element: <PaymentSuccess/>},
      { path: 'payment-failed', element: <PaymentFailed/>},
      { path: 'payment/:classId', element: <PaymentForm /> },
      { path: 'class-detail/:id', element: <ViewClassDetail/>},
      { path: 'classes', element: <ViewClasses /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'news', element: <NewsPage /> },
      { path: 'lesson-preview/:lessonDetailId', element: <LessonDetailPreview /> },
      // { path: 'courses', element: <Courses /> },
      // { path: 'contact', element: <Contact /> },
    ]
  },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
];

// Student routes configuration
const studentRoutes = [
  // { path: '/  ', element: <StudentPage /> },
  { path: '/profile', element: <AccountDetail/> },
  { path: '/schedule', element: <WeeklyTimeTable/> }, 
  { path: '/payment-success', element: <PaymentSuccess/>},
  { path: '/payment-failed', element: <PaymentFailed/>},
  { path: '/payment/:classId', element: <PaymentForm /> },
  { path: '/lesson-detail' , element: <LessonDetailPage/>},
  { path: '/test-schedule', element: <StudentTestSchedule /> },
  { path: '/view-test/:testEventID', element: <ViewTest /> },
  { path: '/take-test/:testEventID', element: <TakeTest /> },
  { path: '/test-result/:testId', element: <TestResult /> },
  { path: '/test-detail/:studentTestID', element: <TestDetail /> },
  { path: '/enroll', element: <EnrollClass/>},
  { path: '/enroll/:classId', element: <ViewEnrolledClassDetail/>},
  { path: '/payment-history', element: <PaymentHistory /> },
  { path: '/payment-history/:paymentID', element: <PaymentDetail /> },
  { path: '/lesson-preview/:lessonDetailId', element: <LessonDetailPreview /> },
  //{ path: '/weekly-time-table', element: <WeeklyTimeTable/>},
];

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Manager Layout */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute allowedRoles={['Manager']}>
              <Layout className="min-h-screen">
                <Sidebar />
                <Layout>
                  <Content className="m-4 p-6 bg-white rounded-[30px]">
                    <Routes>
                      {dashboardRoutes.map((route) => (
                        <Route key={route.path} path={route.path} element={route.element} />
                      ))}
                      <Route path="3d-model-management/models/:id" element={<ModelDetailPage />} />
                    </Routes>
                  </Content>
                </Layout>
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Lecturer Layout */}
        <Route
          path="/lecturer/*"
          element={
            <ProtectedRoute allowedRoles={['Lecture', 'Lecturer', 'Teacher']}>
              <Layout className="min-h-screen">
                <LecturerSidebar />
                <Layout>
                  <Content className="m-4 p-6 bg-white rounded-[30px]">
                    <Routes>
                      {lecturerRoutes.map((route) => (
                        <Route key={route.path} path={route.path} element={route.element} />
                      ))}
                    </Routes>
                  </Content>
                </Layout>
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Public Routes */}
        {publicRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element}>
            {route.children?.map((child) => (
              <Route key={child.path} path={child.path} element={child.element} />
            ))}
          </Route>
        ))}

        {/* Student Routes */}
        <Route
          path="/student/*"
          element={
            <ProtectedRoute allowedRoles={['Student']}>
              <Layout className="min-h-screen">
                <Sidebar />
                <Layout>
                  <Content className="m-4 p-6 bg-white rounded-[30px]">
                    <Routes>
                      {studentRoutes.map((route) => (
                        <Route key={route.path} path={route.path} element={route.element} />
                      ))}
                    </Routes>
                  </Content>
                </Layout>
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* 404 - Catch all */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      
      {/* AI ChatBot - Available on all pages */}
      <ChatBot />
    </Router>
  );
};

export default App;

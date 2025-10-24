import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance with default headers
export const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'ngrok-skip-browser-warning': '1'
  }
});

// Add default ngrok header to all axios requests globally
axios.defaults.headers.common['ngrok-skip-browser-warning'] = '1';

export const endpoints = {
  account: {
    login: 'api/Authentication/login',
    register: 'api/Authentication/register',
    verifyOTP: 'api/Authentication/verify-otp',
    sendOTP: 'api/Email/send'
  },

  manageAccount: {
    getAccount: 'api/Account/list-account-with-role-gender-status',
    createAccount: 'api/Account/create-account',

    // NEW
    update: 'api/Account/update',
    search: 'api/Account/search',
    getByRoleActived: 'api/Account/get-by-role-actived',
    getById: 'api/Account/{accountId}',
    teachingSchedule: 'api/Account/teaching-schedule',
    teachingScheduleDetail: 'api/Account/teaching-schedule-detail/{accountId}',
  },

  manageClass: {
    create: 'api/Class/create',
    getAll: 'api/Class/get-all-paginated',
    getById: 'api/Class/get-by-id',
    getbySubject: 'api/Class/get-by-subject',
    update: 'api/Class/update',
    getByTeacher: 'api/Class/get-by-teacher',
    getByStudent: 'api/Class/get-by-subject-teacher',
    getByStatus: 'api/Class/get-by-status',
    delete: 'api/Class/delete/',
    count: 'api/Subject/count',

    // NEW
    updateStatus: 'api/Class/update-status',
    search: 'api/Class/search',
    getStudentByClass: 'api/Class/get-student-by-class/{classId}',
  },

  manageBlog: {
    // chưa có
  },

  manageSchedule: {
    // chưa có
  },

  manageSubject: {
    create: 'api/Subject/create',
    getAll: 'api/Subject/get-all',
    getSubject: 'api/Subject/get-by-status',
    update: 'api/Subject/update',
    updateStatus: 'api/Subject/update-status',
    getById: 'api/Subject/get-subject-by-',
    delete: 'api/Subject/delete/',
    count: 'api/Subject/count',

    // NEW
    exists: 'api/Subject/exists/{id}',
    tryActivate: 'api/Subject/try-activate/{id}',
  },

  syllabus: {
    // Assessment Criteria
    getAssessmentCriteria: 'api/AssessmentCriteria/get-by-subject',
    createAssessmentCriteria: 'api/AssessmentCriteria/create',
    updateAssessmentCriteria: 'api/AssessmentCriteria/update',
    deleteAssessmentCriteria: 'api/AssessmentCriteria/delete',

    // NEW
    createManyAssessmentCriteria: 'api/AssessmentCriteria/create-many',
    updateListAssessmentCriteria: 'api/AssessmentCriteria/update-list',

    // Syllabus Schedule
    getSyllabusSchedule: 'api/SyllabusSchedule/get-schedule-by-subject',
    addSchedule: 'api/Syllabus/add-schedule',
    updateSchedule: 'api/SyllabusSchedule/bulk-update',
    deleteSchedule: 'api/Syllabus/delete-schedule',

    getScheduleTest: 'api/SyllabusSchedule/get-schedule-by-subject',
    createSyllabusSchedule: 'api/SyllabusSchedule/create-syllabus-schedule',

    // NEW
    getMaxSlot: 'api/SyllabusSchedule/max-slot/{subjectId}',
  },

  class: {
    checkName: 'api/Class/check-name',
    ongoingCount: 'api/Class/ongoing-count/{lecturerId}',
    pendingWritingCount: 'api/StudentTests/pending-writing-count/{lecturerId}',
    upcomingTestCount: 'api/TestEvent/upcoming-count/{lecturerId}',
    activeStudentCount: 'api/Enrollment/active-student-count/{lecturerId}',
  },

  cloudinary: {
    uploadAvatar: 'api/Cloudinary/upload-image-avatar',
    uploadClassImage: 'api/Cloudinary/upload-image-class',
    uploadTestSectionImage: 'api/Cloudinary/upload-image-test-section',
    uploadQuestionImage: 'api/Cloudinary/upload-image-question',
    uploadMCQOptionImage: 'api/Cloudinary/upload-image-mcq-option',
    uploadTestSectionAudio: 'api/Cloudinary/upload-audio-test-section',
    uploadQuestionAudio: 'api/Cloudinary/upload-audio-question',
    uploadMCQOptionAudio: 'api/Cloudinary/upload-audio-mcq-option',

    // NEW
    uploadReadingQuestionImage: 'api/Cloudinary/upload-image-reading-question',
  },

  systemConfig: {
    getConfigByKey: 'api/SystemConfig/get-config-by-key/',
    update: 'api/SystemConfig/update-config',
    getAll: 'api/SystemConfig/get-all-config',
  },

  payment: {
    create: 'api/Payment/create',
    getQr: 'api/Payment/qr/{paymentId}',
    getStatus: 'api/Payment/status/{paymentId}',
    createPayOs: 'api/PayOs/create'
  },

  webhook: {
    payment: 'api/webhooks/payment'
  },

  weatherForecast: {
    get: '/WeatherForecast'
  },

  enrollment: {
    create: 'api/Enrollment/create',
    myClasses: 'api/Enrollment/my-classes/{studentId}',
    checkEnrollment: 'api/Enrollment/check-enrollment/{studentId}/{classId}',
    classEnrollments: 'api/Enrollment/class-enrollments/{classId}',
  },

  lesson: {
    createFromSchedule: 'api/Lesson/create-from-schedule',
    createDetail: 'api/Lesson/create-detail',
    update: 'api/Lesson/update',
    delete: 'api/Lesson/delete/{classLessonID}',
    getByClass: 'api/Lesson/get-by-class/{classID}',
    getByStudent: 'api/Lesson/get-by-student',
    getByLecturer: 'api/Lesson/get-by-lecturer',
    getDetail: 'api/Lesson/get-detail/{classLessonID}',
  },

  questions: {
    generateEmpty: 'api/Questions/generate-empty',
    update: 'api/Questions/questions/update',
    bulkUpdate: 'api/Questions/questions/bulk-update',
    getByTest: 'api/Questions/by-test/{testId}',
  },

  test: {
    create: 'api/Test/create',
    update: 'api/Test/{testId}',
    delete: 'api/Test/{testId}',
    get: 'api/Test/{testId}',
    updateStatus: 'api/Test/{testId}/status',
    myTests: 'api/Test/my-tests',
    all: 'api/Test/all',
    allWithSections: 'api/Test/all-with-sections',
    pendingApproval: 'api/Test/pending-for-approval',
  },

  testSection: {
    create: 'api/TestSection',
    update: 'api/TestSection/{testSectionId}',
    delete: 'api/TestSection/{testSectionId}',
    get: 'api/TestSection/{testSectionId}',
    getByTest: 'api/TestSection/by-test/{testId}',
  },

  testEvent: {
    setup: 'api/TestEvent/setup-test-event/{classId}',
    configure: 'api/TestEvent/configure',
    updateStatus: 'api/TestEvent/update-status',
    deleteByClassId: 'api/TestEvent/delete-by-class-id/{classId}',
    getById: 'api/TestEvent/get-by-id/{testEventID}',
    getByClassId: 'api/TestEvent/get-by-class-id/{classId}',
    getByStudentId: 'api/TestEvent/get-by-student-id/{studentId}',
    getAssignment: 'api/TestEvent/{testEventID}/assignment/',
  },
  dashboardManager: {
    rightSidebar: 'api/DashboardManager/right-sidebar',
    overview: 'api/DashboardManager/overview',
    alertTask: 'api/DashboardManager/alert-task',
  },
  chart: {
    studentSignupMonthly: 'api/Chart/student-signup-monthly',
    revenueByMonth: 'api/Chart/revenue-by-month',
    classCountBySubject:'api/Chart/class-count-by-subject',
    classStatusDistribution : 'api/Chart/class-status-distribution',
    subjectIncome: 'api/Chart/subject-income',
  },
  analytic: {
    paymentTable: 'api/DashboardAnalytics/payment-table',
    lecturerStatistic: 'api/DashboardAnalytics/lecturer-statistic',
  },
  
  chatGemini: {
    chat: 'api/Gemini/chat',
    generate3DModel: 'api/Gemini/generate-3d-model',
  }
};

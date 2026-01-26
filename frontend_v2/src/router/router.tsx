import { createBrowserRouter } from 'react-router-dom'
import RootLayout from './RootLayout'
import ErrorBoundary from '../components/ErrorBoundary'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { 
        index: true, 
        lazy: () => import('../routes/home').then(m => ({ Component: m.default }))
      },
      { 
        path: 'login', 
        lazy: () => import('../routes/login').then(m => ({ Component: m.default }))
      },
      { 
        path: 'contact', 
        lazy: () => import('../routes/contact').then(m => ({ Component: m.default }))
      },
      { 
        path: 'signup', 
        lazy: () => import('../routes/signup').then(m => ({ Component: m.default }))
      },
      { 
        path: 'select-quiz', 
        lazy: () => import('../routes/Quiz/quiz-select').then(m => ({ Component: m.default }))
      },
      { 
        path: 'quiz/:quizId', 
        lazy: () => import('../routes/Quiz/quiz').then(m => ({ Component: m.default }))
      },
      { 
        path: 'quiz/:quizId/review/:attemptId', 
        lazy: () => import('../routes/Quiz/review').then(m => ({ Component: m.default }))
      },
      { 
        path: 'student/dashboard', 
        lazy: () => import('../routes/student/dashboard').then(m => ({ Component: m.default }))
      },
      { 
        path: 'student/learning', 
        lazy: () => import('../routes/student/learning').then(m => ({ Component: m.default }))
      },
      { 
        path: 'dashboard/templates/create', 
        lazy: () => import('../routes/dashboard/create-template').then(m => ({ Component: m.default }))
      },
      {
        path: 'dashboard',
        lazy: () => import('../routes/dashboard').then(m => ({ Component: m.default })),
        children: [
          { 
            index: true, 
            lazy: () => import('../routes/dashboard/index').then(m => ({ Component: m.default }))
          },
          { 
            path: 'groups', 
            lazy: () => import('../routes/dashboard/groups').then(m => ({ Component: m.default }))
          },
          { 
            path: 'groups/:groupId', 
            lazy: () => import('../routes/dashboard/group-details').then(m => ({ Component: m.default }))
          },
          { 
            path: 'students', 
            lazy: () => import('../routes/dashboard/students').then(m => ({ Component: m.default }))
          },
          { 
            path: 'quizzes', 
            lazy: () => import('../routes/dashboard/exams').then(m => ({ Component: m.default }))
          },
          { 
            path: 'templates', 
            lazy: () => import('../routes/dashboard/templates').then(m => ({ Component: m.default }))
          },
          { 
            path: 'learning', 
            lazy: () => import('../routes/dashboard/learning').then(m => ({ Component: m.default }))
          },
          { 
            path: 'settings', 
            lazy: () => import('../routes/dashboard/settings').then(m => ({ Component: m.default }))
          }
        ]
      }
    ]
  }
])

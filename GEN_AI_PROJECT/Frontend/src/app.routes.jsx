import {createBrowserRouter, Navigate} from 'react-router';
import Login from './features/auth/pages/Login';
import Register from './features/auth/pages/Register';
import Protected from './features/auth/components/Protected';
import Home from './features/interview/pages/home';
import Interview from './features/interview/pages/interview';
import ResumeMaker from './features/resume/pages/ResumeMaker';
import ResumeView from './features/resume/pages/ResumeView';
import History from './features/history/pages/History';

export const router = createBrowserRouter([
    { path: '/', element: <Protected> <Home/> </Protected> },
    { path: '/login', element:<Login/> },
    { path: '/register', element: <Register/> },
    { path: '/interview/:interviewId', element: <Protected> <Interview/> </Protected>},
    { path: '/resume', element: <Protected> <ResumeMaker/> </Protected> },
    { path: '/resume/:resumeId', element: <Protected> <ResumeView/> </Protected> },
    { path: '/history', element: <Protected> <History/> </Protected> }
])
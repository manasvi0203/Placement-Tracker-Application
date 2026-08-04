import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import StudentDashboard from './pages/StudentDashboard';
import DriveListings from './pages/DriveListings';
import AdminPanel from './pages/AdminPanel';
import Applications from './pages/Applications';
import Analytics from './pages/Analytics';
import Alerts from './pages/Alerts';

import AdminManageDrives from './pages/AdminManageDrives';
import AdminStudents from './pages/AdminStudents';
import AdminReports from './pages/AdminReports';
import AdminCompanies from './pages/AdminCompany';
import AdminInterviews from './pages/AdminInterviews';


import CoordinatorDashboard from './pages/CoordinatorDashboard';
import CoordinatorDrives from './pages/CoordinatorDrives';
import CoordinatorStudents from './pages/CoordinatorStudents';
import CoordinatorResults from './pages/CoordinatorResults';


function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/"          element={<LandingPage />} />
        <Route path="/auth"      element={<AuthPage />} />

        //student
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/drives"    element={<DriveListings />} />
        <Route path="/admin"     element={<AdminPanel />} />
         <Route path="/applications" element={<Applications />} />
         <Route path="/analytics" element={<Analytics />} />
         <Route path="/alerts" element={<Alerts />} />

         //Admin
        <Route path="/admin/drives" element={<AdminManageDrives />} />
        <Route path="/admin/students" element={<AdminStudents />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/companies"     element={<AdminCompanies />} />
        <Route path="/admin/interviews"    element={<AdminInterviews />} />

        //coordinator
        <Route path='/coordinator' element={<CoordinatorDashboard/>} />
        <Route path="/coordinator/drives" element={<CoordinatorDrives />} />
        <Route path="/coordinator/students" element={<CoordinatorStudents />} />
        <Route path='/coordinator/results' element={<CoordinatorResults/>} />


      </Routes>
    </BrowserRouter>
  );
}

export default App;
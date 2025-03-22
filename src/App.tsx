
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'sonner';
import { GraduationCap } from 'lucide-react';
import { Button } from './components/ui/button';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { StudentDashboard } from './pages/StudentDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="flex items-center">
                  <GraduationCap className="h-8 w-8 text-blue-600" />
                  <span className="ml-2 text-xl font-bold text-gray-900">AI Teacher Assistant</span>
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline">Sign In</Button>
                <Button>Sign Up</Button>
              </div>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={
            <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Empower Education with AI
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  Automate grading, provide personalized feedback, and focus more on teaching
                </p>
                <div className="flex justify-center space-x-4">
                  <Link to="/teacher">
                    <Button size="lg">Get Started as Teacher</Button>
                  </Link>
                  <Link to="/student">
                    <Button size="lg" variant="outline">Join as Student</Button>
                  </Link>
                </div>
              </div>
            </main>
          } />
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/student" element={<StudentDashboard />} />
        </Routes>
      </div>
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;

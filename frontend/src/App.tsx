import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { JobProvider } from './contexts/JobContext';
import { PostProvider } from './contexts/PostContext';
import { WalletProvider } from './contexts/WalletContext';
import { AIProvider } from './contexts/AIContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Feed from './pages/Feed';
import Connections from './pages/Connections';
import AI from './pages/AI';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <JobProvider>
        <PostProvider>
          <WalletProvider>
            <AIProvider>
              <div className="min-h-screen bg-gray-900 text-white">
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/jobs" element={<Jobs />} />
                    <Route path="/jobs/:id" element={<JobDetail />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/feed" element={<Feed />} />
                    <Route path="/connections" element={<Connections />} />
                    <Route path="/ai" element={<AI />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />
                <Toaster />
              </div>
            </AIProvider>
          </WalletProvider>
        </PostProvider>
      </JobProvider>
    </AuthProvider>
  );
}

export default App;
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from './context/AuthContext.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import AnimatedBackground from './components/AnimatedBackground.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import RoleRoute from './components/RoleRoute.jsx'

import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Hackathons from './pages/Hackathons.jsx'
import HackathonDetail from './pages/HackathonDetail.jsx'
import FindTeammates from './pages/FindTeammates.jsx'
import TeamDetail from './pages/TeamDetail.jsx'
import Requests from './pages/Requests.jsx'
import Profile from './pages/Profile.jsx'
import Notifications from './pages/Notifications.jsx'
import HostDashboard from './pages/host/HostDashboard.jsx'
import HackathonForm from './pages/host/HackathonForm.jsx'
import HackathonManage from './pages/host/HackathonManage.jsx'
import NotFound from './pages/NotFound.jsx'

/** Wraps a page with a page-transition animation. */
function Page({ children }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="relative z-10 min-h-[calc(100vh-64px)]"
    >
      {children}
    </motion.main>
  )
}

function DashboardRedirect() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'host' ? '/host' : '/hackathons'} replace />
}

export default function App() {
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col">
      <AnimatedBackground />
      <Navbar />
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Page><Landing /></Page>} />
            <Route path="/login" element={<Page><Login /></Page>} />
            <Route path="/register" element={<Page><Register /></Page>} />
            <Route path="/dashboard" element={<DashboardRedirect />} />

            {/* ---- student routes ---- */}
            <Route path="/hackathons" element={<RoleRoute role="student"><Page><Hackathons /></Page></RoleRoute>} />
            <Route path="/hackathons/:id" element={<RoleRoute role="student"><Page><HackathonDetail /></Page></RoleRoute>} />
            <Route path="/find-teammates" element={<RoleRoute role="student"><Page><FindTeammates /></Page></RoleRoute>} />
            <Route path="/teams/:id" element={<RoleRoute role="student"><Page><TeamDetail /></Page></RoleRoute>} />
            <Route path="/requests" element={<RoleRoute role="student"><Page><Requests /></Page></RoleRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Page><Profile /></Page></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Page><Notifications /></Page></ProtectedRoute>} />

            {/* ---- host routes ---- */}
            <Route path="/host" element={<RoleRoute role="host"><Page><HostDashboard /></Page></RoleRoute>} />
            <Route path="/host/hackathons/new" element={<RoleRoute role="host"><Page><HackathonForm /></Page></RoleRoute>} />
            <Route path="/host/hackathons/:id/edit" element={<RoleRoute role="host"><Page><HackathonForm /></Page></RoleRoute>} />
            <Route path="/host/hackathons/:id" element={<RoleRoute role="host"><Page><HackathonManage /></Page></RoleRoute>} />

            <Route path="*" element={<Page><NotFound /></Page>} />
          </Routes>
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  )
}

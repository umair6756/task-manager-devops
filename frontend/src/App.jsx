import { useState } from "react"
import { Navigate, Route, Routes, useNavigate } from "react-router-dom"
import AuthPage from "./pages/AuthPage"
import TodoDashboard from "./pages/TodoDashboard"

function App() {
  const [session, setSession] = useState(null)

  return <AppRoutes session={session} setSession={setSession} />
}

function AppRoutes({ session, setSession }) {
  const navigate = useNavigate()

  const handleAuth = (payload) => {
    setSession(payload)
    navigate("/todo", { replace: true })
  }

  const handleLogout = () => {
    setSession(null)
    navigate("/", { replace: true })
  }

  return (
    <Routes>
      <Route
        path="/"
        element={session ? <Navigate to="/todo" replace /> : <AuthPage onAuth={handleAuth} />}
      />
      <Route
        path="/todo"
        element={
          session ? (
            <TodoDashboard session={session} onLogout={handleLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to={session ? "/todo" : "/"} replace />} />
    </Routes>
  )
}

export default App

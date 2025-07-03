import { Routes, Route, Navigate } from 'react-router-dom';
import LoginSignup from './components/LoginSignup';
import ManageBlog from './components/manageBlog';
import { useAppSelector } from './hooks';

function App() {
  const session = useAppSelector((state) => state.session.session);

  return (
    <Routes>
      <Route
        path="/"
        element={
          session ? <Navigate to="/manage" replace /> : <LoginSignup />
        }
      />
      <Route
        path="/manage"
        element={
          session ? (
            <ManageBlog userEmail={session.user.email} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
    </Routes>
  );
}

export default App;

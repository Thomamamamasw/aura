import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Home from './pages/Home'
import Profile from './pages/Profile'
import Search from './pages/Search'
import UserProfile from './pages/UserProfile'
import Login from './pages/Login'
import Register from './pages/Register'
import Navbar from './components/Navbar'

function App() {
  const user = JSON.parse(localStorage.getItem('user'))

  return (
    <BrowserRouter>
      <Routes>

        {/* публичные страницы */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* защищённая часть */}
        <Route
          path="/"
          element={
            user ? (
              <>
                <Navbar />
                <Home />
              </>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/search"
          element={
            user ? (
              <>
                <Navbar />
                <Search />
              </>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/profile"
          element={
            user ? (
              <>
                <Navbar />
                <Profile />
              </>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/user/:username"
          element={
            user ? (
              <>
                <Navbar />
                <UserProfile />
              </>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

      </Routes>
    </BrowserRouter>
  )
}

export default App
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { API_URL } from '../config'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleLogin = async () => {
    const res = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    })

    const data = await res.json()

    if (res.ok) {
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/')
    } else {
      alert(data.error)
    }
  }

  return (
    <div className="card">
      <h1>Login</h1>

      <input
        placeholder="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>
        Войти
      </button>

      <p>
        Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
      </p>
    </div>
  )
}

export default Login
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { API_URL } from '../config'

function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleRegister = async () => {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    })

    const data = await res.json()

    if (res.ok) {
      alert('Аккаунт создан, теперь войди')
      navigate('/login')
    } else {
      alert(data.error)
    }
  }

  return (
    <div className="card">
      <h1>Register</h1>

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

      <button onClick={handleRegister}>
        Зарегистрироваться
      </button>

      <p>
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
    </div>
  )
}

export default Register
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { API_URL } from '../config'

function UserProfile() {
  const { username } = useParams()

  const currentUser = JSON.parse(localStorage.getItem('user'))

  const [ratings, setRatings] = useState([])
  const [user, setUser] = useState(null)
  const [topUsers, setTopUsers] = useState([])

  const [vibe, setVibe] = useState(5)
  const [style, setStyle] = useState(5)
  const [communication, setCommunication] = useState(5)

  // загрузка пользователя + рейтингов + топа
  useEffect(() => {
    fetch(`${API_URL}/user/${username}`)
      .then((res) => res.json())
      .then((data) => setUser(data))

    fetch(`${API_URL}/ratings/${username}`)
      .then((res) => res.json())
      .then((data) => setRatings(data))

    fetch(`${API_URL}/top-users`)
      .then((res) => res.json())
      .then((data) => setTopUsers(data))
  }, [username])

  const submitRating = async () => {
    const response = await fetch(`${API_URL}/rate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fromUser: currentUser.username,
        toUser: username,
        vibe,
        style,
        communication,
      }),
    })

    const data = await response.json()

    alert(data.message || data.error)

    fetch(`${API_URL}/ratings/${username}`)
      .then((res) => res.json())
      .then((data) => setRatings(data))
  }

  const average = (key) => {
    if (!ratings.length) return 0

    const total = ratings.reduce((sum, r) => sum + r[key], 0)
    return (total / ratings.length).toFixed(1)
  }

  // 🏆 позиция в топе
  const sorted = [...topUsers].sort((a, b) => b.overall - a.overall)

  const rank = user
    ? sorted.findIndex((u) => u.username === user.username) + 1
    : null

    const statBox = {
    flex: 1,
    textAlign: 'center',
    padding: 15,
    borderRadius: 12,
    background: '#181818',
    color: '#eaeaea',
    boxShadow: '0 2px 10px rgba(0,0,0,0.5)'
    }

    return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 20 }}>

        {/* HEADER PROFILE */}
        <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        padding: 20,
        borderRadius: 16,
        background: '#181818',
        color: '#eaeaea',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        marginBottom: 20
        }}>

        {user?.avatar ? (
            <img
            src={user.avatar}
            alt="avatar"
            style={{
                width: 90,
                height: 90,
                borderRadius: '50%',
                objectFit: 'cover'
            }}
            />
        ) : (
            <div style={{
            width: 90,
            height: 90,
            borderRadius: '50%',
            background: '#ddd'
            }} />
        )}

        <div style={{ flex: 1 }}>

            <h2 style={{ margin: 0 }}>
            {username}
            </h2>

            <p style={{ margin: '5px 0', color: '#666' }}>
            {user?.bio || 'Нет описания'}
            </p>

            <div style={{
            marginTop: 8,
            fontSize: 14,
            color: '#444'
            }}>
            🏆 Позиция: #{rank || '-'}
            </div>

        </div>
        </div>

        {/* STATS */}
        <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 10,
        marginBottom: 20
        }}>

        <div style={statBox}>
            🔥
            <div>{average('vibe')}</div>
            <small>Vibe</small>
        </div>

        <div style={statBox}>
            ✨
            <div>{average('style')}</div>
            <small>Style</small>
        </div>

        <div style={statBox}>
            💬
            <div>{average('communication')}</div>
            <small>Chat</small>
        </div>

        </div>

        {/* RATE FORM */}
        {currentUser && currentUser.username !== username && (
        <div style={{
            padding: 20,
            borderRadius: 16,
            background: '#181818',
            color: '#eaeaea',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
        }}>

            <h3>⭐ Оценить пользователя</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>

            <div>
                <label>🔥 Vibe: {vibe}</label>
                <input
                type="range"
                min="1"
                max="10"
                value={vibe}
                onChange={(e) => setVibe(Number(e.target.value))}
                style={{ width: '100%' }}
                />
            </div>

            <div>
                <label>✨ Style: {style}</label>
                <input
                type="range"
                min="1"
                max="10"
                value={style}
                onChange={(e) => setStyle(Number(e.target.value))}
                style={{ width: '100%' }}
                />
            </div>

            <div>
                <label>💬 Chat: {communication}</label>
                <input
                type="range"
                min="1"
                max="10"
                value={communication}
                onChange={(e) => setCommunication(Number(e.target.value))}
                style={{ width: '100%' }}
                />
            </div>

            </div>

            <button
            onClick={submitRating}
            style={{
                marginTop: 10,
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: '#007bff',
                color: '#fff',
                cursor: 'pointer'
            }}
            >
            Отправить оценку
            </button>

        </div>
        )}

    </div>
    )
}

export default UserProfile
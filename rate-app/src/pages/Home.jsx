import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_URL } from '../config'

function Home() {
  const [topUsers, setTopUsers] = useState([])

  useEffect(() => {

    fetch(`${API_URL}/top-users`)
      .then(res => res.json())
      .then(data => setTopUsers(data))
  }, [])

  return (
    <div style={{ padding: '20px', maxWidth: 800, margin: '0 auto' }}>
      
      <h2 style={{
        fontSize: '22px',
        fontWeight: 600,
        marginBottom: 20
      }}>
        🏆 Топ пользователей
      </h2>

      {topUsers.map((user, index) => (
        <div
          key={user.username}
          style={{
            display: 'flex',
            gap: 15,
            padding: 15,
            borderRadius: 12,
            border: '1px solid #eee',
            marginBottom: 12,
            background: '#fff',
            transition: '0.2s',
            alignItems: 'center'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.01)'
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >

          {/* avatar */}
          <div>
            {user.avatar ? (
              <img
                src={user.avatar}
                alt="avatar"
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: '#ddd'
              }} />
            )}
          </div>

          {/* info */}
          <div style={{ flex: 1 }}>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0 }}>
                #{index + 1} {user.username}
              </h3>

              <span style={{
                fontWeight: 600,
                color: '#555'
              }}>
                ⭐ {Number(user.overall).toFixed(1)}
              </span>
            </div>

            <p style={{
              margin: '5px 0',
              color: '#666'
            }}>
              {user.bio || 'Нет описания'}
            </p>

            <div style={{
              fontSize: 13,
              color: '#777'
            }}>
              🔥 {Number(user.vibe).toFixed(1)} |
              ✨ {Number(user.style).toFixed(1)} |
              💬 {Number(user.communication).toFixed(1)}
            </div>

            <div style={{ marginTop: 8 }}>
              <Link to={`/user/${user.username}`} style={{
                textDecoration: 'none',
                color: '#007bff',
                fontSize: 14
              }}>
                открыть профиль →
              </Link>
            </div>

          </div>

        </div>
      ))}

    </div>
  )
}

export default Home
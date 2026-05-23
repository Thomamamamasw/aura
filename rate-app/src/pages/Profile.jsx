import { useEffect, useState } from 'react'
import { API_URL } from '../config'

function Profile() {
  const localUser = JSON.parse(localStorage.getItem('user'))

  const [user, setUser] = useState(null)
  const [ratings, setRatings] = useState([])
  const [topUsers, setTopUsers] = useState([])

  const [avatar, setAvatar] = useState('')
  const [bio, setBio] = useState('')

  useEffect(() => {
    if (!localUser) return

    fetch(`${API_URL}/user/${localUser.username}`)
      .then((res) => res.json())
      .then((data) => {
        setUser(data)

        setAvatar(data.avatar || '')
        setBio(data.bio || '')
      })
      fetch(`${API_URL}/ratings/${localUser.username}`)
        .then((res) => res.json())
        .then((data) => setRatings(data))

      fetch(`${API_URL}/top-users`)
        .then((res) => res.json())
        .then((data) => setTopUsers(data))
  }, [])
  const average = (key) => {
    if (!ratings.length) return 0

    const total = ratings.reduce((sum, r) => sum + r[key], 0)

    return (total / ratings.length).toFixed(1)
  }

  const sorted = [...topUsers].sort(
    (a, b) => b.overall - a.overall
  )

  const rank = user
    ? sorted.findIndex(
        (u) => u.username === user.username
      ) + 1
    : null
  if (!localUser) {
    return (
      <div className="card">
        <h1>Вы не вошли</h1>
      </div>
    )
  }

  const updateProfile = async () => {
    const response = await fetch(
    `${API_URL}/update-profile`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: localUser.username,
          avatar,
          bio,
        }),
      }
    )

    const data = await response.json()

    alert(data.message || data.error)

    fetch(`${API_URL}/user/${localUser.username}`)
      .then((res) => res.json())
      .then((data) => {
        setUser(data)
      })
  }

  return (
    <div className="card">
      <h1>Мой профиль</h1>

      <br />

      {user?.avatar && (
        <>
          <img
            src={user.avatar}
            alt="avatar"
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />

          <br />
          <br />
        </>
      )}

      <h2>{localUser.username}</h2>

      <br />

      <p>{user?.bio}</p>
      <br />

      <div className="card">
        <h3>🏆 Статистика</h3>

        <br />

        <p>🔥 Vibe: {average('vibe')}</p>
        <p>✨ Style: {average('style')}</p>
        <p>💬 Chat: {average('communication')}</p>

        <br />

        <p>🏆 Место в топе: #{rank || '-'}</p>
      </div>

      <br />
      <br />

      <h3>Avatar URL</h3>

      <br />

      <input
        type="text"
        placeholder="https://..."
        value={avatar}
        onChange={(e) => setAvatar(e.target.value)}
      />

      <br />
      <br />

      <h3>Bio</h3>

      <br />

      <input
        type="text"
        placeholder="Описание профиля"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />

      <br />
      <br />

      <button onClick={updateProfile}>
        Сохранить профиль
      </button>
    </div>
  )
}

export default Profile
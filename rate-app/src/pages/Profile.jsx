import { useEffect, useState } from 'react'
import { API_URL } from '../config'

function Profile() {
  const localUser = JSON.parse(localStorage.getItem('user'))

  const [user, setUser] = useState(null)

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
  }, [])

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
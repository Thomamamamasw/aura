import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_URL } from '../config'

function Search() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch(`${API_URL}/users`)
      .then((res) => res.json())
      .then((data) => {
        setUsers(data)
      })
  }, [])

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <h1>Поиск пользователей</h1>

      <br />

      <input
        type="text"
        placeholder="Введите username"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <br />
      <br />

      {filteredUsers.map((user) => (
        <div key={user.id} className="card">
          <Link to={`/user/${user.username}`}>
            <h3>{user.username}</h3>
          </Link>
        </div>
      ))}
    </div>
  )
}

export default Search
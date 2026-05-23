import { Link, useNavigate } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem('user')
    navigate('/login')
  }

  const linkStyle = {
    padding: '8px 14px',
    borderRadius: '8px',
    textDecoration: 'none',
    color: '#eaeaea',
    background: '#1f1f1f',
    border: '1px solid #2d2d2d'
  }

  const activeHover = {
    background: '#2a2a2a'
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 20px',
      borderBottom: '1px solid #2a2a2a',
      background: '#121212',
      position: 'sticky',
      top: 0
    }}>
      
      <div style={{ display: 'flex', gap: 10 }}>
        <Link to="/" style={linkStyle}>
          🏠 Home
        </Link>

        <Link to="/search" style={linkStyle}>
          🔍 Search
        </Link>

        <Link to="/profile" style={linkStyle}>
          👤 Profile
        </Link>
      </div>

      <button
        onClick={logout}
        style={{
          padding: '8px 14px',
          borderRadius: '8px',
          border: '1px solid #2d2d2d',
          background: '#ff4d4f',
          color: 'white',
          cursor: 'pointer'
        }}
      >
        Logout
      </button>
    </div>
  )
}

export default Navbar
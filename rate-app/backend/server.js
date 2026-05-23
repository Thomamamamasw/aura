const express = require('express')
const cors = require('cors')
const bcrypt = require('bcrypt')
const { Pool } = require('pg')

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

const app = express()

app.use(cors({
  origin: "https://aura-b2dd.vercel.app",
  credentials: true
}))
app.use(express.json())


/* ---------------- TABLES ---------------- */
db.prepare(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT,
  avatar TEXT,
  bio TEXT
)
`).run()

db.prepare(`
CREATE TABLE IF NOT EXISTS ratings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fromUser TEXT,
  toUser TEXT,
  vibe INTEGER,
  style INTEGER,
  communication INTEGER
)
`).run()

/* ---------------- HOME ---------------- */
app.get('/', (req, res) => {
  res.json({ message: 'Backend работает' })
})

/* ---------------- REGISTER ---------------- */
app.post('/register', async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'Заполните все поля' })
  }

  const existing = await db.query(
    'SELECT * FROM users WHERE username = $1',
    [username]
  )

  if (existing.rows.length > 0) {
    return res.status(400).json({
      error: 'Пользователь уже существует'
    })
  }

  const hashed = bcrypt.hashSync(password, 10)

  const result = await db.query(
    'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id',
    [username, hashed]
  )

  res.json({
    message: 'Пользователь создан',
    id: result.rows[0].id
  })
})

/* ---------------- LOGIN ---------------- */
app.post('/login', async (req, res) => {
  const { username, password } = req.body

  const result = await db.query(
    'SELECT * FROM users WHERE username = $1',
    [username]
  )

  const user = result.rows[0]

  if (!user) {
    return res.status(401).json({ error: 'Неверные данные' })
  }

  const ok = bcrypt.compareSync(password, user.password)

  if (!ok) {
    return res.status(401).json({ error: 'Неверные данные' })
  }

  res.json({
    message: 'OK',
    user: {
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio
    }
  })
})

/* ---------------- USERS ---------------- */
app.get('/users', async (req, res) => {
  const result = await db.query(
    'SELECT id, username FROM users'
  )

  res.json(result.rows)
})

/* ---------------- RATE ---------------- */
app.post('/rate', async (req, res) => {
  const { fromUser, toUser, vibe, style, communication } = req.body

  const existing = await db.query(
    'SELECT * FROM ratings WHERE fromUser = $1 AND toUser = $2',
    [fromUser, toUser]
  )

  if (existing.rows.length > 0) {
    return res.status(400).json({
      error: 'Уже оценивал'
    })
  }

  await db.query(
    `
    INSERT INTO ratings
    (fromUser, toUser, vibe, style, communication)
    VALUES ($1, $2, $3, $4, $5)
    `,
    [fromUser, toUser, vibe, style, communication]
  )

  res.json({
    message: 'Оценка добавлена'
  })
})

/* ---------------- RATINGS ---------------- */
app.get('/ratings/:username', async (req, res) => {
  const result = await db.query(
    'SELECT * FROM ratings WHERE toUser = $1',
    [req.params.username]
  )

  res.json(result.rows)
})

/* ---------------- UPDATE PROFILE ---------------- */
app.post('/update-profile', async (req, res) => {
  const { username, avatar, bio } = req.body

  await db.query(
    `
    UPDATE users
    SET avatar = $1, bio = $2
    WHERE username = $3
    `,
    [avatar, bio, username]
  )

  res.json({
    message: 'Профиль обновлен'
  })
})

/* ---------------- USER ---------------- */
app.get('/user/:username', async (req, res) => {
  const result = await db.query(
    `
    SELECT id, username, avatar, bio
    FROM users
    WHERE username = $1
    `,
    [req.params.username]
  )

  res.json(result.rows[0])
})

/* ---------------- TOP USERS ---------------- */
app.get('/top-users', async (req, res) => {
  const result = await db.query(`
    SELECT 
      u.username,
      u.avatar,
      u.bio,

      COALESCE(AVG(r.vibe), 0) as vibe,
      COALESCE(AVG(r.style), 0) as style,
      COALESCE(AVG(r.communication), 0) as communication,

      (
        COALESCE(AVG(r.vibe), 0) +
        COALESCE(AVG(r.style), 0) +
        COALESCE(AVG(r.communication), 0)
      ) / 3 as overall

    FROM users u
    LEFT JOIN ratings r
      ON u.username = r.toUser

    GROUP BY u.username
  `)

  const top = result.rows
    .sort((a, b) => b.overall - a.overall)
    .slice(0, 10)

  res.json(top)
})

/* ---------------- START SERVER ---------------- */
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log('Server running on port', PORT)
})
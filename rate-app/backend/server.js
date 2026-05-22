const express = require('express')
const cors = require('cors')
const Database = require('better-sqlite3')
const bcrypt = require('bcrypt')

const app = express()

app.use(cors({ origin: "*" }))
app.use(express.json())

// DB
const db = new Database('database.db')

/* ---------------- CREATE TABLES ---------------- */
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
app.post('/register', (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'Заполните все поля' })
  }

  const existing = db.prepare(
    'SELECT * FROM users WHERE username = ?'
  ).get(username)

  if (existing) {
    return res.status(400).json({ error: 'Пользователь уже существует' })
  }

  const hashedPassword = bcrypt.hashSync(password, 10)

  const stmt = db.prepare(
    'INSERT INTO users (username, password) VALUES (?, ?)'
  )

  const info = stmt.run(username, hashedPassword)

  res.json({
    message: 'Пользователь создан',
    id: info.lastInsertRowid
  })
})

/* ---------------- LOGIN ---------------- */
app.post('/login', (req, res) => {
  const { username, password } = req.body

  const user = db.prepare(
    'SELECT * FROM users WHERE username = ?'
  ).get(username)

  if (!user) {
    return res.status(401).json({ error: 'Неверные данные' })
  }

  const match = bcrypt.compareSync(password, user.password)

  if (!match) {
    return res.status(401).json({ error: 'Неверные данные' })
  }

  const safeUser = {
    id: user.id,
    username: user.username,
    avatar: user.avatar,
    bio: user.bio
  }

  res.json({
    message: 'Успешный вход',
    user: safeUser
  })
})

/* ---------------- USERS ---------------- */
app.get('/users', (req, res) => {
  const users = db.prepare(
    'SELECT id, username FROM users'
  ).all()

  res.json(users)
})

/* ---------------- RATE ---------------- */
app.post('/rate', (req, res) => {
  const { fromUser, toUser, vibe, style, communication } = req.body

  const exists = db.prepare(
    'SELECT * FROM ratings WHERE fromUser = ? AND toUser = ?'
  ).get(fromUser, toUser)

  if (exists) {
    return res.status(400).json({
      error: 'Вы уже оценивали этого пользователя'
    })
  }

  db.prepare(`
    INSERT INTO ratings (fromUser, toUser, vibe, style, communication)
    VALUES (?, ?, ?, ?, ?)
  `).run(fromUser, toUser, vibe, style, communication)

  res.json({ message: 'Оценка добавлена' })
})

/* ---------------- RATINGS ---------------- */
app.get('/ratings/:username', (req, res) => {
  const ratings = db.prepare(
    'SELECT * FROM ratings WHERE toUser = ?'
  ).all(req.params.username)

  res.json(ratings)
})

/* ---------------- UPDATE PROFILE ---------------- */
app.post('/update-profile', (req, res) => {
  const { username, avatar, bio } = req.body

  db.prepare(`
    UPDATE users
    SET avatar = ?, bio = ?
    WHERE username = ?
  `).run(avatar, bio, username)

  res.json({ message: 'Профиль обновлен' })
})

/* ---------------- USER ---------------- */
app.get('/user/:username', (req, res) => {
  const user = db.prepare(
    'SELECT id, username, avatar, bio FROM users WHERE username = ?'
  ).get(req.params.username)

  res.json(user)
})

/* ---------------- TOP USERS ---------------- */
app.get('/top-users', (req, res) => {
  const users = db.prepare(`
    SELECT 
      u.username,
      u.avatar,
      u.bio,
      IFNULL(AVG(r.vibe), 0) as vibe,
      IFNULL(AVG(r.style), 0) as style,
      IFNULL(AVG(r.communication), 0) as communication,
      (
        IFNULL(AVG(r.vibe), 0) +
        IFNULL(AVG(r.style), 0) +
        IFNULL(AVG(r.communication), 0)
      ) / 3 as overall
    FROM users u
    LEFT JOIN ratings r ON u.username = r.toUser
    GROUP BY u.username
  `).all()

  const top = users
    .sort((a, b) => b.overall - a.overall)
    .slice(0, 10)

  res.json(top)
})

/* ---------------- START ---------------- */
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
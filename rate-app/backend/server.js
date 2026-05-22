const express = require('express')
const cors = require('cors')
const sqlite3 = require('sqlite3').verbose()
const bcrypt = require('bcrypt')

const app = express()

// 🔐 CORS (для продакшена лучше ограничить потом доменом)
app.use(cors({
  origin: "*"
}))

app.use(express.json())

const db = new sqlite3.Database('./database.db')

// USERS
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    avatar TEXT,
    bio TEXT
  )
`)

// RATINGS
db.run(`
  CREATE TABLE IF NOT EXISTS ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fromUser TEXT,
    toUser TEXT,
    vibe INTEGER,
    style INTEGER,
    communication INTEGER
  )
`)

app.get('/', (req, res) => {
  res.json({ message: 'Backend работает' })
})

/* ---------------- REGISTER ---------------- */
app.post('/register', (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'Заполните все поля' })
  }

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка сервера' })
    }

    db.run(
      'INSERT INTO users(username, password) VALUES(?, ?)',
      [username, hashedPassword],
      function (err) {
        if (err) {
          return res.status(400).json({
            error: 'Пользователь уже существует'
          })
        }

        res.json({
          message: 'Пользователь создан',
          id: this.lastID
        })
      }
    )
  })
})

/* ---------------- LOGIN ---------------- */
app.post('/login', (req, res) => {
  const { username, password } = req.body

  db.get(
    'SELECT * FROM users WHERE username = ?',
    [username],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка сервера' })
      }

      if (!user) {
        return res.status(401).json({ error: 'Неверные данные' })
      }

      bcrypt.compare(password, user.password, (err, result) => {
        if (err || !result) {
          return res.status(401).json({ error: 'Неверные данные' })
        }

        // ❗ НЕ возвращаем пароль
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
    }
  )
})

/* ---------------- USERS ---------------- */
app.get('/users', (req, res) => {
  db.all(
    'SELECT id, username FROM users',
    [],
    (err, users) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка сервера' })
      }

      res.json(users)
    }
  )
})

/* ---------------- RATE ---------------- */
app.post('/rate', (req, res) => {
  const { fromUser, toUser, vibe, style, communication } = req.body

  db.get(
    `SELECT * FROM ratings WHERE fromUser = ? AND toUser = ?`,
    [fromUser, toUser],
    (err, existingRating) => {
      if (existingRating) {
        return res.status(400).json({
          error: 'Вы уже оценивали этого пользователя'
        })
      }

      db.run(
        `
        INSERT INTO ratings (fromUser, toUser, vibe, style, communication)
        VALUES (?, ?, ?, ?, ?)
        `,
        [fromUser, toUser, vibe, style, communication],
        function (err) {
          if (err) {
            return res.status(500).json({ error: 'Ошибка сервера' })
          }

          res.json({ message: 'Оценка добавлена' })
        }
      )
    }
  )
})

/* ---------------- RATINGS ---------------- */
app.get('/ratings/:username', (req, res) => {
  const username = req.params.username

  db.all(
    `SELECT * FROM ratings WHERE toUser = ?`,
    [username],
    (err, ratings) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка сервера' })
      }

      res.json(ratings)
    }
  )
})

/* ---------------- PROFILE UPDATE ---------------- */
app.post('/update-profile', (req, res) => {
  const { username, avatar, bio } = req.body

  db.run(
    `
    UPDATE users
    SET avatar = ?, bio = ?
    WHERE username = ?
    `,
    [avatar, bio, username],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Ошибка сервера' })
      }

      res.json({ message: 'Профиль обновлен' })
    }
  )
})

/* ---------------- USER ---------------- */
app.get('/user/:username', (req, res) => {
  const username = req.params.username

  db.get(
    `
    SELECT id, username, avatar, bio
    FROM users
    WHERE username = ?
    `,
    [username],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка сервера' })
      }

      res.json(user)
    }
  )
})

/* ---------------- TOP USERS ---------------- */
app.get('/top-users', (req, res) => {
  db.all(
    `
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
    `,
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка сервера' })
      }

      const top = rows
        .sort((a, b) => b.overall - a.overall)
        .slice(0, 10)

      res.json(top)
    }
  )
})

/* ---------------- START SERVER ---------------- */
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
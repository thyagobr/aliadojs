import cookie_parser from 'cookie-parser'
import cors from 'cors'
import bodyParser from 'body-parser'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import path from 'path'
import dotenv from 'dotenv'
dotenv.config()
import pg from 'pg'
const Pool = pg.Pool
import express from 'express'
const app = express()
import http from 'http'
const server = http.Server(app)
import { Server } from 'socket.io'
const io = new Server(server)
server.listen(process.env.PORT || 3001, () => {
  console.log("Okay, let's go");
});


// __dirname workaround for modules
const module_url = new URL(import.meta.url)
const __dirname = path.dirname(module_url.pathname)
// END - __dirname workaaround for modules

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(cors());

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'src/views'));
app.use(express.static('public'))

app.use(cookie_parser())

app.use(function(req, res, next) {
  console.log(`[${Date.now()}] ${req.method} ${req.originalUrl}`)
  console.log("*** Params:", req.params)
  console.log("*** Body:", req.body)
  next()
})

const pool = new Pool({
  user: 'dev',
  host: 'localhost',
  database: 'aliadojs',
  password: 'password',
  port: 5432
})

app.get('/', async (req, res) => {
  res.render('layout', { partial: 'login' })
})

app.get('/create_user', async (req, res) => {
  res.render('layout', { partial: 'create_user', nickname: req.query.nickname })
})

app.post('/create_user', async (req, res) => {
  let nickname = req.body.nickname.toLowerCase()
  let password = req.body.password
  let password_confirmation = req.body.password_confirmation
  if (password != password_confirmation) {
    res.render('layout', { partial: 'create_user', nickname: nickname, error: "password_confirmation_wrong" })
  } else {
    try {
      const client = await pool.connect()
      const result = await client.query('select * from players')
      if (result.rows.length == 0) {
        let password_digest = bcrypt.hashSync(password, 10)
        let insert_player = await client.query("insert into players (nickname, password_digest) values ($1, $2) returning id",
        [nickname, password_digest])
        res.cookie('st', { uid: insert_player.rows[0].id })
        res.redirect('/game')
      } else {
        res.render('layout', { partial: 'create_user', nickname: nickname, error: "already_exists" })
        return
      }
    } catch(error) {
      console.log(error)
      console.log("db fetch error")
    }
  }
})

app.post('/login', async (req, res) => {
  let nickname = req.body.nickname.toLowerCase()
  let password = req.body.password
  let player = null

  try {
    const client = await pool.connect()
    const result = await client.query('select id, nickname, password_digest  from players where nickname = $1', [nickname])
    if (result.rows.length == 0) {
      res.redirect('/login')
      return
    } else {
      player = result.rows[0]
    }
  } catch(error) {
    console.log("db fetch error")
  }

  if ((player) && (bcrypt.compareSync(password, player.password_digest))) {
    res.cookie('ajs', { id: player.id, nickname: player.nickname })
    res.redirect('/game')
  } else {
    res.redirect('/')
  }
})

app.get('/game', async (req, res) => {
  if (!req.cookies.ajs.id) {
    return res.redirect('/')
  }
  res.render('layout', { partial: 'game' })
})

io.on('connection', (socket) => {
  console.log("socket connected")
  socket.join('lobby')
  socket.to('lobby').emit('player_connected')
})

// Auth
const authenticate_token = async function(req, res, next) {
  const auth_header = req.headers['authorization'];
  const token = auth_header && auth_header.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  const user = await User.findOne({ current_session_token: token });

  if (user) {
    req.user = user;
    next()
  } else {
    res.sendStatus(403)
  }
}


const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const path = require('path')
require('dotenv').config()

const app = express();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(cors());

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'src/views'));
app.use(express.static('public'))

app.use(function(req, res, next) {
  console.log(`[${Date.now()}] ${req.method} ${req.originalUrl}`)
  console.log("*** Params:", req.params)
  console.log("*** Body:", req.body)
  next()
})

app.get('/', async (req, res) => {
  res.render('layout', { partial: 'login' })
})

app.post('/login', async (req, res) => {
  let nickname = req.body.nickname
  let password = req.body.password
  if ((nickname.toLowerCase() === "thyago") && (password == "passwortchen")) {
    res.redirect('/game')
  }
})

app.get('/game', async (req, res) => {
  res.render('layout', { partial: 'game' })
})

app.listen(process.env.PORT || 3001, () => {
  console.log("Okay, let's go");
});

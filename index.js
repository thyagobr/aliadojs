const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
require('dotenv').config();

const app = express();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(cors());

app.use(function(req, res, next) {
  console.log(`[${Date.now()}] ${req.method} ${req.originalUrl}`)
  console.log("*** Params:", req.params)
  console.log("*** Body:", req.body)
  next()
})

const GameObject = require('./src/entities/game_object')
const Player = require('./src/entities/player')

const go = new GameObject()
const player1 = new Player(go) // While we have no storage

app.post('/join/toalha', async (req, res) => {
  let id = req.body.player_id
  let player = go.players.find((player) => player.id == id)
  if (player) {
    console.log(`Player id ${id} has joined`)
    res.status(200)
  } else {
    res.sendStatus(401)
    console.log(`Player id ${id} does not exist`)
  }
})

app.get('/roll_die', async (req, res) => {
  roll_dice()
  res.send(go);
}) 

app.listen(process.env.PORT || 3001, () => {
  console.log("Okay, let's go");
});

const roll_dice = () => {
  go.dice_1 = Math.trunc(Math.random() * 6) + 1
  go.dice_2 = Math.trunc(Math.random() * 6) + 1
  go.dice_1_used = false
  go.dice_2_used = false
}

//const further_dice_rolling = () => {
//  console.log(`${go.dice_1}, ${go.dice_2}`)
//
//  // Only spend the 6 if there are pieces at home
//  let all_pieces_at_home = go.current_player.pieces.every((piece) => piece.at_home)
//  if (all_pieces_at_home && !this.dice_combo_leaves_the_house()) {
//    console.log("next_turn")
//    go.game_state = "next_turn"
//  }
//  if ((go.dice_1 == 6) && (go.current_player.pieces.some((piece) => piece.at_home))) {
//    go.dice_1_used = true
//    go.current_player.spawn_piece()
//    console.log(`${go.dice_1} used`)
//  }
//
//  //                                                             // Only spend the 6 if there are pieces at home
//  if ((go.dice_2 == 6) && (go.current_player.pieces.some((piece) => piece.at_home))) {
//    go.dice_2_used = true
//    go.current_player.spawn_piece()
//    console.log(`${go.dice_2} used`)
//  }
//
//  // Can the plaeyer do anything?
//  let movable_pieces = this.go.current_player.pieces.filter((piece) => piece.current_node != null)
//  if (movable_pieces.length > 0) {
//    go.game_state = "awaiting_player_movement"
//  }
//}


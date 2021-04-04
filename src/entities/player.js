class Player {
  constructor(go) {
    this.go = go
    this.id = this.go.players.length
    this.go.players.push(this)
  }
}

module.exports = Player

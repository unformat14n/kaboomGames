function loader(){
  loadFont('hell', 'assets/sprites/font.png', 16, 16.1, {chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ:!'})
  loadSprite('player', 'assets/sprites/player.png', {
    sliceX: 4,
    sliceY: 4,
    anims:
    {
      run: {from: 0, to: 7, loop: true},
      hit: {from: 8, to: 15, speed: 8}
    }
  })
  loadSprite('demon', 'assets/sprites/demon.png', {
    sliceX: 3,
    sliceY: 1,
    anims:
    {
      eat: {from: 0, to: 2, speed: 4},
    }
  })
}

export default loader;
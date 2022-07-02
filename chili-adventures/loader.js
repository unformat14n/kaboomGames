function loader () {
  loadSprite('red-chili', "./sprites/red-chili.png", {
    sliceX: Math.floor(4),
    sliceY: Math.floor(4),
    anims: {
      idle: {from: 3, to: 4, loop: true, speed: 2 },
      run: {from: 5, to: 12, loop: true, speed: 13},
      fall: 1,
      hurt: 2,
      death: 0,
    }
  })
  loadSprite('knife', "./sprites/knife.png", {
    sliceX: Math.floor(4),
    sliceY: Math.floor(2),
    anims: {
      walking: {from: 0, to: 6, loop: true, speed: 10},
    }
  })
  loadSprite('chef', "./sprites/chef.png", {
    sliceX: Math.floor(2),
    sliceY: Math.floor(1),
    anims: {
      idle: {from: 0, to: 1, loop: true, speed: 4},
    }
  })
  loadSprite('bean', "./sprites/hungry-bean.png", {
    sliceX: Math.floor(2),
    sliceY: Math.floor(1),
    anims: {
      idle: {from: 0, to: 1, loop: true, speed: 4},
    }
  })
  loadSprite('spring', "./sprites/spring.png", {
    sliceX: Math.floor(2),
    sliceY: Math.floor(1),
    anims: {
      idle: 0,
      used: 1,
    }
  })
  loadSprite('tile1', "./sprites/tile1.png")
  loadSprite('spikes', "./sprites/spikes.png")
  loadSprite('go', "./sprites/game-over-screen.png");
  loadSprite('door', "./sprites/door.png");


  loadSound('go', './sounds/game_over.wav')
}

export default loader;
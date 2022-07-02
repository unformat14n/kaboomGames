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
  loadSprite('fireball', "./sprites/fireball.png", {
    sliceX: Math.floor(2),
    sliceY: Math.floor(1),
    anims: {
      idle: {from: 0, to: 1, loop: true, speed: 4},
    }
  })
  loadSprite('eater', "./sprites/chili_eater.png", {
    sliceX: Math.floor(4),
    sliceY: Math.floor(2),
    anims: {
      idle: 0,
      eat: {from: 1, to: 4,},
      hide: {from: 5, to: 6}
    }
  })
  loadSprite('tile1', "./sprites/tile1.png")
  loadSprite('c1', "./sprites/cloud1.png")
  loadSprite('c2', "./sprites/cloud2.png")
  loadSprite('sun', "./sprites/sun.png")
  loadSprite('life', "./sprites/lifes.png")
  loadSprite('m1', "./sprites/moon1.png")
  loadSprite('m2', "./sprites/moon2.png")
  loadSprite('spikes', "./sprites/spikes.png")
  loadSprite('go', "./sprites/game-over-screen.png");
  loadSprite('won', "./sprites/win-screen.png");
  loadSprite('main', "./sprites/main_screen.png");
  loadSprite('door', "./sprites/door.png");
  loadSprite('fire_thrower', "./sprites/fire_thrower.png");


  loadSound('go', './sounds/game_over.wav')
  loadSound('main', './sounds/poor_chili.wav')
  loadSound('lvl1', './sounds/mad-rush.wav')
  loadSound('lvl3', './sounds/vintage-dash.wav')
  loadSound('lvl2', './sounds/hot_pepper.wav')
  loadSound('lvl4', './sounds/final_rush.wav')
  loadSound('jump', './sounds/jump.wav')
  loadSound('hurt', './sounds/hurt.wav')
  loadSound('super_jump', './sounds/super_jump.wav')
}

export default loader;
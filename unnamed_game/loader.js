function loader(){
  loadSprite("cat", "assets/sprites/player.png", {
    sliceX: 4,
    sliceY: 2,
    anims: 
    {
      base: {from: 0, to: 1, loop: true, speed: 5},
      hurt: 2,
      fire: {from: 3, to: 4, loop: true, speed: 5},
      ice: {from: 5, to: 6, loop: true, speed: 5},
    }
  });
  loadSprite("pointer", "assets/sprites/pointer.png", {
    sliceX: 2,
    sliceY: 1,
    anims: 
    {
      pointer: {from: 0, to: 1, loop: true, speed: 5},
    }
  })
  loadSprite("atks", "assets/sprites/atks.png", {
    sliceX: 4,
    sliceY: 7,
    anims: 
    {
      base: {from: 0, to: 7, loop: true, speed: 15},
      fire: {from: 8, to: 15, loop: true, speed: 15},
      ice: {from: 16, to: 25, loop: true, speed: 15},
    }
  })
  loadSprite("fx", "assets/sprites/fx.png", {
    sliceX: 5,
    sliceY: 2,
    anims: 
    {
      fire: {from: 0, to: 8, speed: 12},
    }
  })
  loadSprite("power_ups", "assets/sprites/power-ups.png", {
    sliceX: 4,
    sliceY: 1,
    anims: 
    {
      ice: {from: 0, to: 1, loop: true, speed: 5},
      fire: {from: 2, to: 3, loop: true, speed: 8},
    }
  })
  loadSprite("wall", "assets/sprites/wall.png");
  loadSprite("ice_cat", "assets/sprites/ice_cat.png");
}

export default loader;
function loader(){
  loadSprite("cat", "assets/sprites/player.png", {
    sliceX: 4,
    sliceY: 2,
    anims: 
    {
      base: {from: 0, to: 1, loop: true, speed: 5},
      hurt: 2,
      fire: {from: 3, to: 4, loop: true, speed: 10},
      ice: {from: 5, to: 6, loop: true, speed: 10},
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
  loadSprite("cat_bullet", "assets/sprites/cat_bullet.png", {
    sliceX: 4,
    sliceY: 2,
    anims: 
    {
      idle: {from: 0, to: 7, loop: true, speed: 15},
    }
  })
}

export default loader;
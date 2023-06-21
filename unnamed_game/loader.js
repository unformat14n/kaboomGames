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
}

export default loader;
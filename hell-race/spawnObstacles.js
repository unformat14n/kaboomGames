function spawnObs(a, i) {
  const FLOOR_HEIGHT = 48;
  let SPEED = 200;
  let count = 0;
  // add tree obj
  if(chance(0.5)){
    add([
      rect(48, rand(32, 90)),
      area(),
      outline(4),
      pos(width(), height() - FLOOR_HEIGHT),
      origin("botleft"),
      color(255, 180, 255),
      move(LEFT, SPEED),
      cleanup(),
      layer('obs'),
      "obs",
    ])
  }else {
    add([
      rect(50, 90),
      area(),
      outline(4),
      pos(width(), height() - 80),
      origin("botleft"),
      color(255, 180, 255),
      move(LEFT, SPEED),
      cleanup(),
      layer('obs'),
      "obs",
    ])
  }

  const player = get('player')[0];

  onUpdate(() => {
    if(count > i){
      SPEED += a;
      // debug.log(count);
      wait(0.001, () => i *= 2)
    }
  })

  every('obs', (o) => {
    o.onDestroy(() => {
      count+=1;
    })
  })

  // wait a random amount of time to spawn next tree
  wait(rand(0.5, 4), spawnObs)
}

export default spawnObs;
function spawnObs() {
  const FLOOR_HEIGHT = 48;
  const SPEED = 200
  // add tree obj
  add([
    rect(48, rand(32, 96)),
    area(),
    outline(4),
    pos(width(), height() - FLOOR_HEIGHT),
    origin("botleft"),
    color(255, 180, 255),
    move(LEFT, SPEED),
    cleanup(),
    layer('obs'),
    "tree",
  ])

  // wait a random amount of time to spawn next tree
  wait(rand(1, 4), spawnObs)

}

export default spawnObs;
function spawnClouds(c){
  add([
    sprite(choose(['c1', 'c2'])),
    scale(randi(1, 5)),
    pos(width(), randi(40, height() - height()/2)),
    move(LEFT, randi(100, 200)),
    layer('bg'),
    color(c[0] + 50, c[1], c[2] + 50),
    opacity(0.7),
    fixed(),
    origin('center'),
    'cloud'
  ])

  wait(randi(2, 6), () => spawnClouds(c))
}
export default spawnClouds;
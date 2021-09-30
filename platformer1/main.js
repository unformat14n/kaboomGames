debug.inspect = true;

const SPEED = 80;

const map = addLevel([
  "            ",
  "            ",
  "            ",
  "==========  ",
  "            ",
  "            ",
], {
  width: 32,
  height: 40,
  "=": () => [
    sprite("tiles", {
      frame: 0,
    }),
    solid(),
    area(),
  ]
})

const player = add([
  sprite("player", {
    anim: "idle",
    animSpeed: 1,
    flipX: false,
  }),
  origin("bot"),
  scale(1),
  body(),
  area({width: 20, height: 45}),
  pos(40, 80)
]);
// player.play("idle", {pingpong: true});

keyPress("left", () => {
  player.play("walk");
  player.flipX(true);
})

keyPress("right", () => {
  player.play("walk");
  player.flipX(false);
})

keyDown("left", () => {
  player.move(-SPEED, 0);
})
keyDown("right", () => {
  player.move(SPEED, 0);
})
cd
player.action(() => {
  if(keyIsReleased("left")){
    player.play("idle");
  }
  if(keyIsReleased("right")){
    player.play("idle");
  }
})
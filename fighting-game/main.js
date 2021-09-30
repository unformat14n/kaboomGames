debug.inspect = true;

const SPEED = 90;

scene("main", () => {

  const map = addLevel([
    "              ",
    "              ",
    "              ",
    "              ",
    "==============",
    "              ",
  ], {
    width: 20,
    height: 20,
    "=": () => [
      sprite("arcane-archer"),
      area(),
      solid(),
    ],
  })

  const player = add([
    sprite("arcane-archer", {
      frame: 40,
    }),
    scale(),
    origin("center"),
    body(),
    area({scale: 0.6}),
    pos(60, 60),
    {
      walking: false,
    }
  ])

  keyDown("left", () => {
    player.move(-SPEED, 0);
    player.walking = true;
  })
  keyDown("right", () => {
    player.move(SPEED, 0);
    player.walking = true;
  })
  keyPress("left", () => {
    player.flipX(true);
  })
  keyPress("right", () => {
    player.flipX(false);
  })
  keyRelease(["right", "left"], () => {
    player.walking = false;
  })

  const handleAnimations = () => {
    const anim = player.curAnim();
    if(player.walking){
      if(anim !== "walk"){
        player.animSpeed = 1;
        player.play("walk");
      }
    }
    else if (player.falling){
      if(anim !== 'fall'){
        player.play("fall");
      }
    }
    else {
      if(anim !== "idle"){
        player.animSpeed = 0.5;
        player.play("idle");
      }
    }
  };

  player.action(() => {
    handleAnimations();

    if(player.grounded()){
      player.falling = true;
    }else {
      player.falling = false;
    }
  })
});

go("main"); 
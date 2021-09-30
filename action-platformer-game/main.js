debug.inspect = true;

scene("main", () => {
  const SPEED = 100;
  const JUMP_FORCE = 500;

  const map = addLevel([
    "                   ",
    "                 w ",
    "            =======",
    "============≠≠≠≠≠≠≠",
    "                   ",
    "                   ",
  ], {
    width: 32,
    height: 35,
    pos: vec2(0, 18),
    "=": () => [
      sprite("tiles", {
        frame: 0,
      }),
      solid(),
      area(),
    ],
    "≠": () => [
      sprite("tiles", {
        frame: 1,
      })
    ],
    "w": () => [
      sprite("wizard", {
        anim: "idle",
      }),
      origin("center"),
      area({scale: 0.7}),
      "enemy",
    ]
  })
  camPos({x: 276, y: 0})

  const player = add([
    sprite("player", {
      anim: "idle",
      animSpeed: 1,
      flipX: false,
    }),
    origin("bot"),
    scale(1),
    body(),
    area({width: 35, height: 45}),
    pos(40, 80),
    health(3),
    {
      walking: false,
      falling: false,
      kicking: false,
      attacking: false,
    }
  ]);
  // player.play("idle", {pingpong: true});
  camScale(vec2(2.5, 2.5))

  keyPress("left", () => {
    // player.play("walk");
    player.flipX(true);
  })

  keyPress("right", () => {
    // player.play("walk");
    player.flipX(false);
  })

  keyDown("left", () => {
    player.move(-SPEED, 0);
    player.walking = true;
  })
  keyDown("right", () => {
    player.move(SPEED, 0);
    player.walking = true;
  })

  keyPress("space", () => {
    player.kicking = true;
    player.attacking = true;
  })

  keyPress("up", () => {
    if(player.grounded()){
      player.jump(JUMP_FORCE);
    }
  })

  keyRelease(["left", "right"], () => {
    player.walking = false;
  })

  const handleAnimations = () => {
    const anim = player.curAnim();
    if (player.falling) {
      if (anim !== "fall") {
        player.play("fall");
      }
    } else if (player.walking) {
      if (anim !== "walk") {
        player.animSpeed = 1;
        player.play("walk");
      }
    } else if (player.kicking) {
      if (anim !== "kick") {
        player.animSpeed = 1;
        player.play("kick");
        wait(0.5, () => {player.kicking = false; player.attacking = false})
      }
    } else {
      if (anim !== "idle") {
        player.animSpeed = 0.5;
        player.play("idle");
      }
    }
  };

  player.collides("enemy", (e) => {
    if(player.kicking){
      destroy(e); 
    }
  })

  player.action(() => {
    if(!player.grounded()){
      player.falling = true;
    }else {
      player.falling = false;
    }

    handleAnimations();

    if(player.pos.x > 276){
      camPos({x: player.pos.x, y: 0})
    }
  })
})

go("main");
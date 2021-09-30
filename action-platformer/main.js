// debug.inspect = true;

const SPEED = 100;
const JUMP_FORCE = 550;

scene("main", () => {
  const music = play("main-theme", {loop: true, volume: 0.1})

  layers([
    "bg",
    "enviroment",
    "enemies",
    "effects",
    "character",
    "ui",
  ])

  const background = [
    add([
      sprite("background"),
      layer("bg"),
      scale(2, 3.5),
      pos(205, 200),
      origin("center"),
      fixed(),
    ]),
    add([
      sprite("background"),
      layer("bg"),
      scale(2, 3.5),
      pos(621, 200),
      origin("center"),
      fixed(),
    ])
  ];

  const map = addLevel([
    "                                            ",
    "                                            ",
    "                                            ",
    "                     w                      ",
    "              =================   w         ",
    "==============----__----_-_---_========  ===",
  ], {
    width: 32,
    height: 32,
    "=": () => [
      sprite("platform1"),
      area(),
      solid(),
      layer("enviroment"),
    ],
    "-": () => [
      sprite("platform2", {
        frame: 0
      }),
      layer("enviroment"),
    ],
    "_": () => [
      sprite("platform2", {
        frame: 1
      }),
      layer("enviroment"),
    ],
    "w": () => [
      sprite("fire-worm", {
        anim: "walking",
        flipX: true,
      }),
      area({width: 40, height: 30, offset: {x: 0, y: 5}}),
      origin("center"),
      body(),
      layer("enemies"),
      "enemy",
      "worm",
      {
        limit: {max: 0, min: 0},
        reachLimit: false,
        dir: -1,
        speed: 15,
        death: false,
      }
    ],
  })

  camScale(vec2(2, 2));
  camPos(180, 90)

  const player = add([
    sprite("arcane-archer", {
      frame: 40,
    }),
    scale(),
    origin("center"),
    body(),
    area({scale: 0.3}),
    pos(60, 60),
    layer("character"),
    health(3),
    {
      walking: false,
      falling: false,
      attacking: false,
      hit: false,
      death: false,
      direction: 1,
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
    player.direction = -1;
  })
  keyPress("right", () => {
    player.flipX(false);
    player.direction = 1;
  })
  keyRelease(["right", "left"], () => {
    player.walking = false;
  })

  keyPress("space", () => {
    if(player.grounded()){
      player.jump(JUMP_FORCE);
    }
  })

  const shootArrow = (dir) => {
    var arrow = null;
    wait(0.6, () => {
      if(dir == 1){
        arrow = add([
          sprite("arrow", {
            flipX: false,
          }),
          pos(player.pos.x + 30, player.pos.y - 5),
          area(),
          origin("center"),
          lifespan(3),
          layer("effects"),
        ]);
      } else if (dir == -1) {
        arrow = add([
          sprite("arrow", {
            flipX: true,
          }),
          pos(player.pos.x - 30, player.pos.y - 5),
          area(),
          origin("center"),
          lifespan(1),
          layer("effects"), 
        ]);
      }
      arrow.action(() => {
        if (dir > 0) {
          arrow.move(250, 0);
        }
        if (dir < 0) {
          arrow.move(-250, 0);
        }
      })
      arrow.collides("enemy", (e) => {
        play("arrow-hit", {
          volume: 0.2,
        });
        destroy(arrow);
        e.death = true;
        play("worm-death", {volume: 0.2});
        e.play("death")
        wait(1, () => destroy(e));
      })
    });
  }

  keyPress("a", () => {
    player.attacking = true;
    wait(0.5, () => {play("bow-shoot", {volume: 0.2})})
    shootArrow(player.direction);
    wait(0.8, () => {player.attacking = false})
  })

  const handleAnimations = () => {
    const anim = player.curAnim();
    if (player.death){
      if(anim !== "death"){
        player.animSpeed = 1;
        player.play("death");
        wait(0.8, () => {destroy(player); go("gameover")})
      }
    }
    else if (player.hit){
      if(anim !== "hurt"){
        player.animSpeed = 1;
        player.play("hurt");
        wait(0.1, () => {player.hit = false})
      }
    }
    else if (player.attacking){
      if(anim !== "attack"){
        player.animSpeed = 1;
        player.play("attack");
      }
    }
    else if (player.falling){
      if(anim !== "fall"){
        player.animSpeed = 1;
        player.play("fall");
      }
    }
    else if(player.walking){
      if(anim !== "walk"){
        player.animSpeed = 1;
        player.play("walk");
      }
    }
    else {
      if(anim !== "idle"){
        player.animSpeed = 1;
        player.play("idle");
      }
    }
  };

  player.collides("enemy", () => {
    player.hit = true;
    play("player-hit", {volume: 0.2})
    if(player.direction > 0){
      player.moveBy(-50, 0);
    }else {
      player.moveBy(50, 0);
    }
    player.hurt(1);
  })

  player.on("death", () => {
    player.death = true;
    play("player-death", {volume: 0.2});
    music.stop()
  })

  player.action(() => {
    handleAnimations();

    if(player.grounded()){
      player.falling = false;
    }else {
      player.falling = true;
    }

    if(player.pos.x > 180){
      camPos({x: player.pos.x, y: 90})
    }
  })

  const worms = get("worm");
  for(const worm of worms){
    worm.limit = {max: worm.pos.x + 50, min: worm.pos.x - 50};
    worm.action(() => {
      if(!worm.death){
        if(Math.floor(worm.pos.x) > worm.limit.max){
          worm.reachLimit = true;
          worm.dir = -1;
          worm.flipX(true);
        }
        if(Math.floor(worm.pos.x) < worm.limit.min){
          worm.reachLimit = false;
          worm.dir = 1;
          worm.flipX(false);
        }
    
        if(worm.reachLimit){
          worm.move(worm.speed * worm.dir, 0);
        }else {
          worm.move(worm.speed * worm.dir, 0)
        }
      }
    })
  }
});

scene("gameover", () => {
  play("gameover", {volume: 0.2})
  add([
    text("GAME OVER", {size: 50}),
    pos(width()/2, height()/2),
    origin("center"),
  ])
  keyPress("enter", () => {
    go("main");
  })
})

go("main"); 
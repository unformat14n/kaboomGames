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
    "                                                                                                                                       ",
    "                                                                                                                                       ",
    "                                                            w      s                                                                   ",
    "                     w                                  ================       w                                   s                   ",
    "              =================   w          w   =======-___---≈≈-≈--_≈≈===========     w       s       w     ==============  ====     ",
    "==============----__----_-_---_========  ========--_-__-________---_____--__--___-_===========================--≈_-_≈-_-≈--_  -_≈-=====",
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
    "≈": () => [
      sprite("platform3"),
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
    "s": () => [
      sprite("spider", {
        anim: "walk",
        flipX: false,
      }),
      area({width: 25, height: 20, offset: {x: 0, y: 5}}),
      origin("center"),
      body(),
      layer("enemies"),
      "enemy",
      "spider",
      {
        limit: {max: 0, min: 0},
        reachLimit: false,
        dir: -1,
        speed: 60,
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
      arrow.collides("worm", (e) => {
        play("arrow-hit", {
          volume: 0.2,
        });
        destroy(arrow);
        e.death = true;
        play("worm-death", {volume: 0.2});
        e.play("death")
        wait(1, () => destroy(e));
      })
      arrow.collides("spider", (e) => {
        play("arrow-hit", {
          volume: 0.2,
        });
        destroy(arrow);
        e.death = true;
        play("spider-death", {volume: 0.2});
        e.play("death");
        wait(0.6, () => {destroy(e);})
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

  player.collides("enemy", (e) => {
    if(!e.death){
      player.hit = true;
      play("player-hit", {volume: 0.2})
      if(player.direction > 0){
        player.moveBy(-50, 0);
      }else {
        player.moveBy(50, 0);
      }
      player.hurt(1);
    }
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

    if(player.pos.x > 4200){
      go("end-demo");
    }

    if(player.pos.x > 180 && player.pos.x < 4139){
      camPos({x: player.pos.x, y: 90})
    }

    console.log(player.pos.x)
  })

  const worms = get("worm");
  for(const w of worms){
    w.limit = {max: w.pos.x + 50, min: w.pos.x - 50};
    w.action(() => {
      if(!w.death){
        if(Math.floor(w.pos.x) > w.limit.max){
          w.reachLimit = true;
          w.dir = -1;
          w.flipX(true);
        }
        if(Math.floor(w.pos.x) < w.limit.min){
          w.reachLimit = false;
          w.dir = 1;
          w.flipX(false);
        }
    
        if(w.reachLimit){
          w.move(w.speed * w.dir, 0);
        }else {
          w.move(w.speed * w.dir, 0)
        }
      }
    })
  }
  const spiders = get("spider");
  for(const s of spiders){
    s.limit = {max: s.pos.x + 70, min: s.pos.x - 70};
    s.action(() => {
      if(!s.death){
        if(Math.floor(s.pos.x) > s.limit.max){
          s.reachLimit = true;
          s.dir = -1;
          s.flipX(false);
        }
        if(Math.floor(s.pos.x) < s.limit.min){
          s.reachLimit = false;
          s.dir = 1;
          s.flipX(true);
        }
    
        if(s.reachLimit){
          s.move(s.speed * s.dir, 0);
        }else {
          s.move(s.speed * s.dir, 0)
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

scene("end-demo", () => {
  add([
    text("END OF THE DEMO, STAY TUNED TO SEE THE FINAL PROJECT", {size: 15}),
    pos(width()/2, height()/2),
    origin("center"),
  ])
})

go("main"); 
// debug.inspect = true;

const SPEED = 90;
const JUMP_FORCE = 500;

scene("main", () => {

  layers([
    "enviroment",
    "enemies",
    "effects",
    "character",
    "ui",
  ])

  const map = addLevel([
    "                        ",
    "                        ",
    "                        ",
    "                     w  ",
    "              ==========",
    "==============----------",
  ], {
    width: 32,
    height: 32,
    "=": () => [
      sprite("column1", {
        frame: 0,
      }),
      area(),
      solid(),
      layer("enviroment"),
    ],
    "-": () => [
      sprite("column1", {
        frame: 1,
      }),
      layer("enviroment"),
    ],
    "w": () => [
      sprite("fire-worm", {
        anim: "walking",
        flipX: true,
      }),
      area({scale: 0.6}),
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

  camScale(vec2(1.5, 1.5));
  camPos(230, 60)

  const player = add([
    sprite("arcane-archer", {
      frame: 40,
    }),
    scale(),
    origin("center"),
    body(),
    area({scale: 0.45}),
    pos(400, 60),
    layer("character"),
    {
      walking: false,
      falling: false,
      attacking: false,
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
          pos(player.pos.x + 10, player.pos.y),
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
          pos(player.pos.x - 10, player.pos.y),
          area(),
          origin("center"),
          lifespan(3),
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
    shootArrow(player.direction);
    wait(0.5, () => {play("bow-shoot", {volume: 0.2})})
  })

  const handleAnimations = () => {
    const anim = player.curAnim();
    if (player.attacking){
      if(anim !== "attack"){
        player.animSpeed = 1;
        player.play("attack");
        wait(0.8, () => {player.attacking = false})
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

  player.action(() => {
    handleAnimations();

    if(player.grounded()){
      player.falling = false;
    }else {
      player.falling = true;
    }

    if(player.pos.x > 270){
      camPos({x: player.pos.x, y: 60})
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

go("main"); 
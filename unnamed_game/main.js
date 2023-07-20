import kaboom from "https://unpkg.com/kaboom@3000.0.1/dist/kaboom.mjs";
import loader from "./loader.js";
import maps from "./maps.js";

const k = kaboom({
  crisp: true,
  background: [20, 20, 40],
  global: true,
  debug: true,
  canvas: document.querySelector('#kaboom'),
  degub: true,
});

loader();

camScale(0.25);

function createFX(type, p) {
  const fx = add([sprite("fx", { anim: type }), pos(p), anchor("center")]);
  fx.onAnimEnd((anim) => {
    if (anim == "fire") {
      fx.destroy();
    }
  });
}

const game = add([timer()]);
const ui = add([fixed(), z(100)]);

const map = addLevel(maps["1"],
  {
    tileWidth: 256,
    tileHeight: 256,
    tiles: {
      "=": () => [sprite("wall"), body({ isStatic: true }), area(), "wall"],
      f: () => [
        sprite("power_ups", { anim: "fire" }),
        area(),
        "power_up",
        "fire",
      ],
      i: () => [
        sprite("power_ups", { anim: "ice" }),
        area(),
        "power_up",
        "ice",
      ],
      g: () => [
        sprite("enemies", {anim: "ghost"}),
        anchor("center"),
        scale(),
        rotate(0),
        area({ scale: 0.8 }),
        state("idle"),
        health(100),
        timer(),
        "enemy",
        "ghost",
        {
          playerDist: {x: 0, y: 0},
        }
      ],
      s: () => [
        sprite("enemies", {anim: "skull"}),
        anchor("center"),
        scale(),
        rotate(0),
        area({ scale: 0.8 }),
        state("move"),
        health(100),
        timer(),
        color(),
        // bounce(),
        // enemy({ dmg: 50 }),
        "enemy",
        "skull",
        {
          playerDist: {x: 0, y: 0},
        }
      ],
    },
  }
);

onKeyPress("escape", () => {
  if (game.paused /*&& !menu.hidden*/) {
    // music.paused = false;
    game.paused = false;
    map.paused = false;
    // menu.paused = true;
    // menu.hidden = true;
  } else if (!game.paused /*&& menu.hidden*/) {
    // music.paused = true;
    game.paused = true;
    map.paused = true;
    // menu.paused = false;
    // menu.hidden = false;
  }
});

const player = game.add([
  sprite("cat", { anim: "base" }),
  scale(1),
  area({
    shape: new Polygon([
      vec2(0),
      vec2(125, 20),
      vec2(125, 100),
      vec2(0, 125),
      vec2(-50, 100),
      vec2(-50, 20),
    ]),
  }),
  body(),
  pos(width() / 2, height() / 2),
  anchor("center"),
  state("normal"),
  health(100),
  "player",
  {
    speed: 600,
    aim: 1,
    mode: "base",
    blinking: false,
  },
]);

player.onStateEnter("blinking", async () => {
  player.blinking = true;
  for(let i=0; i<4; i++){
    player.opacity = 0;
    await wait(0.1);
    player.opacity = 1;
    await wait(0.15);
  }
  player.blinking = false;
  player.enterState("normal");
})

onResize(() => {
  k.width = window.innerWidth;
  k.height = window.innerHeight;
})

map.get("ghost").forEach((g) => {
  g.onUpdate(() => {
    g.pos.x += dt() * rand(-1, 1) * 100;
    g.pos.y += dt() * rand(-1, 1) * 100;
    g.playerDist = g.pos.dist(player.pos);
  });
  g.onDeath(() => {
    addKaboom(g.pos, {scale: 2});
    g.destroy();
  })
  g.onStateUpdate("idle", () => {
    if(g.playerDist < 1200){
      if (g.state !== "idle") return;
      // console.log('hi')
      g.enterState("prepare");
    }
  });
  g.onStateEnter("prepare", async () => {
    await wait(1.5);
    if (g.state !== "prepare") return;
    g.enterState("attack");
  })
  g.onStateEnter("attack", async () => {
    const dir = player.pos.sub(g.pos).unit();
    const dest = player.pos.add(dir.scale(500));
    const dis = player.pos.dist(g.pos);
    const t = dis / 1024;
    // k.play("wooosh", {
    //   detune: rand(-300, 300),
    //   volume: Math.min(1, 320 / dis),
    // })
    await g.tween(
      g.pos,
      dest,
      t,
      (p) => (g.pos = p),
      easings.easeInOutQuad
    );
    g.enterState("idle");
  });
});

map.get("skull").forEach((s) => {
  s.onUpdate(() => {
    // s.pos.x += dt() * rand(-1, 1) * 100;
    // s.pos.y += dt() * rand(-1, 1) * 100;
    s.playerDist = s.pos.dist(player.pos);
  });
  s.onDeath(() => {
    addKaboom(s.pos, {scale: 2});
    s.destroy();
  })
  s.onStateUpdate("move", () => {
    if(s.playerDist < 2048){
      const dir = player.pos.sub(s.pos).unit()
			s.move(dir.scale(512))
    }
  })
});

const handleAnims = () => {
  const curAnim = player.curAnim();
  if (player.mode == "fire") {
    if (curAnim !== "fire") {
      player.play("fire");
    }
  } else if (player.mode == "ice") {
    if (curAnim !== "ice") {
      player.play("ice");
    }
  } else {
    if (curAnim !== "base") {
      player.play("base");
    }
  }
};

player.onUpdate(() => {
  handleAnims();

  // Set the viewport center to player.pos
  camPos(player.pos);
});

const pointer = player.add([
  sprite("pointer", { anim: "pointer" }),
  anchor("center"),
  scale(0.5),
  pos(180, 50),
  rotate(0),
  {
    translate: (player) => {
      if (player.aim == 1) {
        return 0;
      }
      if (player.aim == 2) {
        return 45;
      }
      if (player.aim == 3) {
        return 315;
      }
      if (player.aim == 4) {
        return 270;
      }
      if (player.aim == 5) {
        return 90;
      }
      if (player.aim == -1) {
        return 180;
      }
      if (player.aim == -2) {
        return 135;
      }
      if (player.aim == -3) {
        return 225;
      }
    },
  },
]);

pointer.onUpdate(() => {
  if (player.aim > 0) {
    if (player.aim == 2) {
      pointer.pos.x = 150;
      pointer.pos.y = 150;
      pointer.angle = 45;
    } else if (player.aim == 3) {
      pointer.angle = -45;
      pointer.pos.y = -50;
      pointer.pos.x = 100;
    } else if (player.aim == 4) {
      pointer.pos.x = 0;
      pointer.pos.y = -90;
      pointer.angle = -90;
    } else if (player.aim == 5) {
      pointer.pos.x = 0;
      pointer.pos.y = 150;
      pointer.angle = 90;
    } else {
      pointer.pos.x = 180;
      pointer.pos.y = 50;
      pointer.angle = 0;
    }
  } else {
    if (player.aim == -2) {
      pointer.pos.x = -150;
      pointer.pos.y = 150;
      pointer.angle = -225;
    } else if (player.aim == -3) {
      pointer.pos.x = -100;
      pointer.pos.y = -50;
      pointer.angle = 225;
    } else {
      pointer.pos.x = -180;
      pointer.pos.y = 50;
      pointer.angle = 180;
    }
  }
});

onKeyPress("left", () => {
  if (game.paused) return;
  player.flipX = true;
  player.area.offset = vec2(-75, 0);
});

onKeyPress("right", () => {
  if (game.paused) return;
  player.flipX = false;
  player.area.offset = vec2(0, 0);
});

const aimDirs = {
  a: -1,
  q: -3,
  z: -2,
  w: 4,
  x: 5,
  e: 3,
  d: 1,
  c: 2,
}

for(const aim in aimDirs){
  onKeyPress(aim, () => {
    if (game.paused) return;
    console.log(aim);
    // if(player.isColliding("wall")) return;
    player.aim = aimDirs[aim];
  })
}

const dirs = {
  left: LEFT,
  right: RIGHT,
  up: UP,
  down: DOWN,
};

const evs = [];

game.onDestroy(() => {
  evs.forEach((ev) => ev.cancel());
});

for (const dir in dirs) {
  evs.push(
    onKeyDown(dir, () => {
      if (game.paused) return;
      if(player.isColliding("wall")) return;
      player.move(dirs[dir].scale(player.speed));
    })
  );
}

onKeyPress("s", () => {
  game.add([
    sprite("atks", { anim: player.mode }),
    scale(1),
    pos(player.pos.x, player.pos.y + 35),
    area({ scale: 0.7 }),
    anchor("center"),
    move(pointer.translate(player), 2000),
    offscreen({ destroy: true }),
    "bullet",
  ]);
  if (player.mode == "fire") {
    game.add([
      sprite("atks", { anim: player.mode }),
      scale(1),
      pos(player.pos.x, player.pos.y + 35),
      area({ scale: 0.7 }),
      anchor("center"),
      move(pointer.translate(player) + 125, 2000),
      offscreen({ destroy: true }),
      "bullet",
    ]);
    game.add([
      sprite("atks", { anim: player.mode }),
      scale(1),
      pos(player.pos.x, player.pos.y + 35),
      area({ scale: 0.7 }),
      anchor("center"),
      move(pointer.translate(player) - 125, 2000),
      offscreen({ destroy: true }),
      "bullet",
    ]);
  }
});



onCollide("bullet", "wall", (b, w) => {
  b.destroy();
});
onCollide("bullet", "enemy", (b, e) => {
  e.hurt(player.mode == "fire" ? 10 : 5);
  // console.log(e.hp());
  b.destroy();
})
onCollide("shield", "enemy", (s, e) => {
  if(player.mode == "ice"){
    e.hurt(10);
    console.log(e.hp())
  }
})

player.onCollide("power_up", (u) => {
  if (u.is("fire")) {
    u.destroy();
    player.mode = "fire";
    createFX("fire", player.pos);
  } else {
    u.destroy();
    player.mode = "ice";
    player.get("shield").forEach((b) => {
      b.pause = false;
    });
  }
});
player.onCollide("enemy", (e) => {
  if(player.blinking) return;
  player.hurt(5);
  // console.log(player.hp())
})

player.onHurt(() => {
  player.enterState("blinking");
  player.mode = "base";
})

for (let i = 1; i <= 3; i++) {
  player.add([
    sprite("ice_cat"),
    scale(2),
    pos(0, 0),
    area(),
    anchor("center"),
    "shield",
    {
      offset: i * 2,
    },
  ]);
}

player.get("shield").forEach((s) => {
  // console.log("hello")
  s.onUpdate(() => {
    s.pos.x = wave(-480, 480, time() * 2 + s.offset, Math.cos);
    s.pos.y = wave(-480, 480, time() * 2 + s.offset);
    // console.log("hello");
    if (player.mode !== "ice") {
      s.hidden = true;
      s.pause = true;
    } else {
      s.hidden = false;
      s.pause = false;
    }
  });
});

onUpdate(() => {
  // if (isKeyDown("up")) {
  //   player.aim = 4;
  // }
  // if (isKeyDown("down")) {
  //   player.aim = 5;
  // }

  // if (isKeyDown("left")) {
  //   if (isKeyDown("up")) {
  //     player.aim = -3;
  //   } else if (isKeyDown("down")) {
  //     player.aim = -2;
  //   } else {
  //     player.aim = -1;
  //   }
  // }

  // if (isKeyDown("right")) {
  //   if (isKeyDown("up")) {
  //     player.aim = 3;
  //   } else if (isKeyDown("down")) {
  //     player.aim = 2;
  //   } else {
  //     player.aim = 1;
  //   }
  // }
});

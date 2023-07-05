import kaboom from "https://unpkg.com/kaboom@3000.0.1/dist/kaboom.mjs";
import loader from "./loader.js";

kaboom({
  width: 1024,
  height: 512,
  crisp: true,
  background: [20, 20, 40],
  global: true,
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

onKeyPress("escape", () => {
  if (game.paused /*&& !menu.hidden*/) {
    // music.paused = false;
    game.paused = false;
    // menu.paused = true;
    // menu.hidden = true;
  } else if (!game.paused /*&& menu.hidden*/) {
    // music.paused = true;
    game.paused = true;
    // menu.paused = false;
    // menu.hidden = false;
  }
});

const map = addLevel(
  [
    "==================",
    "=                =",
    "=                =",
    "=            g   =",
    "=                =",
    "=                =",
    "=                =",
    "=                =",
    "==================",
  ],
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
        sprite("ghost", {anim: "idle"}),
        anchor("center"),
        scale(),
        rotate(0),
        area({ scale: 0.8 }),
        state("idle"),
        health(100),
        timer(),
        color(),
        // bounce(),
        // enemy({ dmg: 50 }),
        "minion",
        {
          playerDist: {x: 0, y: 0},
        }
      ],
    },
  }
);

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
  "player",
  {
    speed: 512,
    aim: 1,
    state: "base",
  },
]);

map.get("minion").forEach((btfly) => {
  // console.log("hello")
  btfly.onUpdate(() => {
    btfly.pos.x += dt() * rand(-1, 1) * 100;
    btfly.pos.y += dt() * rand(-1, 1) * 100;
    btfly.playerDist = btfly.pos.dist(player.pos);
  });
  btfly.onStateUpdate("idle", async () => {
    if(btfly.playerDist < 2048){
      // await wait(2);
      if (btfly.state !== "idle") return;
      btfly.enterState("prepare");
      // console.log('ho!')
    }
  });
  btfly.onStateEnter("prepare", async () => {
    await wait(3);
    if (btfly.state !== "prepare") return;
    btfly.enterState("attack");
  })
  btfly.onStateEnter("attack", async () => {
    const dir = player.pos.sub(btfly.pos).unit();
    const dest = player.pos.add(dir.scale(500));
    console.log(player.pos.dist(btfly.pos));
    const dis = player.pos.dist(btfly.pos);
    // if(dis < 1024){
      const t = dis / 1024;
      // k.play("wooosh", {
      //   detune: rand(-300, 300),
      //   volume: Math.min(1, 320 / dis),
      // })
      await btfly.tween(
        btfly.pos,
        dest,
        t,
        (p) => (btfly.pos = p),
        easings.easeInOutQuad
      );
      btfly.enterState("idle");
    // }
  });
  btfly.onStateEnter("dizzy", async () => {
    await btfly.wait(2);
    if (btfly.state !== "dizzy") return;
    btfly.enterState("idle");
  });
  btfly.onStateUpdate("dizzy", async () => {
    btfly.angle += dt() * DIZZY_SPEED;
  });
  btfly.onStateEnd("dizzy", async () => {
    btfly.angle = 0;
  });
});

const handleAnims = () => {
  const curAnim = player.curAnim();
  if (player.state == "fire") {
    if (curAnim !== "fire") {
      player.play("fire");
    }
  } else if (player.state == "ice") {
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
  player.flipX = false;
  player.area.offset = vec2(0, 0);
});

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
      player.move(dirs[dir].scale(500));
      // const xMin = player.width / 2
      // const yMin = player.height / 2
      // const xMax = WIDTH - player.width / 2
      // const yMax = HEIGHT - player.height / 2
      // if (player.pos.x < xMin) player.pos.x = xMin
      // if (player.pos.y < yMin) player.pos.y = yMin
      // if (player.pos.x > xMax) player.pos.x = xMax
      // if (player.pos.y > yMax) player.pos.y = yMax
    })
  );
}

onKeyPress("a", () => {
  game.add([
    sprite("atks", { anim: player.state }),
    scale(1),
    pos(player.pos.x, player.pos.y + 35),
    area({ scale: 0.7 }),
    anchor("center"),
    move(pointer.translate(player), 2000),
    offscreen({ destroy: true }),
    "bullet",
  ]);
  if (player.state == "fire") {
    game.add([
      sprite("atks", { anim: player.state }),
      scale(1),
      pos(player.pos.x, player.pos.y + 35),
      area({ scale: 0.7 }),
      anchor("center"),
      move(pointer.translate(player) + 125, 2000),
      offscreen({ destroy: true }),
      "bullet",
    ]);
    game.add([
      sprite("atks", { anim: player.state }),
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
player.onCollide("power_up", (u) => {
  if (u.is("fire")) {
    u.destroy();
    player.state = "fire";
    createFX("fire", player.pos);
  } else {
    u.destroy();
    player.state = "ice";
    player.get("shield").forEach((b) => {
      b.pause = false;
    });
  }
});

for (let i = 1; i <= 3; i++) {
  player.add([
    sprite("ice_cat"),
    scale(2),
    pos(0, 0),
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
    if (player.state !== "ice") {
      s.hidden = true;
      s.pause = true;
    } else {
      s.hidden = false;
      s.pause = false;
    }
  });
});

onUpdate(() => {
  if (isKeyDown("up")) {
    player.aim = 4;
  }
  if (isKeyDown("down")) {
    player.aim = 5;
  }

  if (isKeyDown("left")) {
    if (isKeyDown("up")) {
      player.aim = -3;
    } else if (isKeyDown("down")) {
      player.aim = -2;
    } else {
      player.aim = -1;
    }
  }

  if (isKeyDown("right")) {
    if (isKeyDown("up")) {
      player.aim = 3;
    } else if (isKeyDown("down")) {
      player.aim = 2;
    } else {
      player.aim = 1;
    }
  }
});

import kaboom from "https://unpkg.com/kaboom@3000.0.1/dist/kaboom.mjs";
import loader from "./loader.js";

kaboom({
  width: 1024,
  height: 512,
  crisp: true,
  // canvas: document.getElementById('kaboom'),
  background: [20,20,40],
  global: true,
})

loader();

camScale(0.25)

const player = add([
  sprite("cat", {anim: "base"}), 
  scale(1),
  pos(width()/2, height()/2),
  anchor("center"),
  {
    speed: 512,
    aim: 0,
  }
])

onKeyPress("left", () => {
  player.flipX = true;
})

onKeyPress("right", () => {
  player.flipX = false;
})

const dirs = {
  "left": LEFT,
  "right": RIGHT,
  "up": UP,
  "down": DOWN,
}

for (const dir in dirs) {
  onKeyDown(dir, () => {
    player.move(dirs[dir].scale(player.speed))
  })
}

onUpdate(() => {
  if(isKeyDown("left")){
    if(isKeyDown("up")){
      player.aim = 135;
    }
    else if(isKeyDown("down")){
      player.aim = 225;
    }
    else {
      player.aim = 180;
    }
  }

  if(isKeyDown("right")){
    if(isKeyDown("up")){
      player.aim = 45;
    }
    else if(isKeyDown("down")){
      player.aim = 315;
    }
    else {
      player.aim = 0;
    }
  }

  console.log(player.aim);
})

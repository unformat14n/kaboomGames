import kaboom from "https://unpkg.com/kaboom/dist/kaboom.mjs"
import loader from "./loader.js";
import spawnObs from "./spawnObstacles.js";
import appear from "./appear.js";

const koptions = {
  width: 860,
  height: 450,
  canvas: document.getElementById("game-screen"),
  // global: false,
  background: [30, 0, 30],
  scale: 1,
  crisp: true,
  font: 'hell',
}

kaboom(koptions);
loader();

const Game = {
  state: {
    over: false,
  },
  info: {
    acceleration: 40,
    increaseAcceleration: 10,
  }
}
const LAYERS = ['bg', 'obs', 'player', 'ui']

scene('main', () => {
  let tl = add([
    text('HELL RACE', {
      transform: (idx, ch) => ({
        color: hsl2rgb(wave(0.95, 1, time() * 4), 1, 0.5), 
        pos: vec2(0, wave(-2, 2, time() * 1.5 + idx * 0.5)),
        angle: wave(-9, 9, time() * 1.5 + idx),
      })
    }),
    scale(5),
    pos(width()/2, height()/6),
    origin('center'),
  ])
  let p = add([
    text('PLAY', {
      transform: (idx, ch) => ({
        // color: hsl2rgb(0, 0, wave(0.5, 1, time() * 2)), 
        // pos: vec2(0, wave(-1, 1, time() * 4 * 0.5 + idx)),
        angle: wave(-9, 9, time() * 2.5 + idx),
      })
    }),
    scale(3),
    area({scale: 3}),
    color(200, 40, 40),
    pos(width()/2, height()/2.5),
    origin('center'),
  ])

  p.onClick(() => {
    go('play')
  })
})

scene('play', () => {
  Game.state.over = false;
  gravity(1000)
  layers(LAYERS);

  const player = add([
    sprite('player', {anim: 'run'}),
    pos(100, height()/2),
    scale(5),
    area({width: 3, height: 9}),
    body(),
    layer('player'),
    origin('center'),
    {
      jumping: false,
      fall: false,
      slide: false,
      hit: false,
    },
    "player"
  ])

  add([
    rect(width(), 50),
    color(0,0,0),
    pos(width()/2, height() - 25),
    origin('center'),
    solid(),
    area(),
  ])

  onKeyPress('space', () => {
    if(player.grounded() && !player.slide && !player.hit){
      player.jump(500);
      if(player.curAnim() !== 'jump'){
        player.play('jump');
      }
      wait(0.4, () => player.play('fall'))
    }
  })
  onKeyPress('down', () => {
    if(player.grounded() && !player.slide && !player.hit) {
      player.slide = true;
      player.area.height = 2;
      if(player.curAnim() !== 'slide'){
        player.play('slide');
      }
      wait(0.8, () => player.slide = false)
      wait(0.8, () => player.area.height = 8);
    }
  })

  player.onCollide('obs', (t) => {
    Game.state.over = true;
    player.hit = true;
    if(player.curAnim() !== 'hit'){
      player.play('hit')
    }
  })

  player.onAnimEnd('hit', () => {
    let d = add([
      sprite('demon'),
      pos(player.pos.x - 20 , player.pos.y - 10),
      scale(5),
      opacity(0),
      appear(),
      origin('center'),
      layer('player'),
    ])
    wait(0.4, () => d.play('eat'))
    d.onAnimEnd('eat', () => {
      wait(0.2, () => go('game over'));
    })
  })

  player.onUpdate(() => {
    if(player.grounded()){
      if(player.curAnim() !== "run" && !player.hit && !player.slide){
        player.play('run')
      }
    }
  })

  spawnObs(Game.info.acceleration, Game.info.increaseAcceleration);

  every("obs", (t) => {
    t.onUpdate(() => {
      if(Game.state.over){
        t.unuse('move');
      }
    })
    if(Game.state.over){
      t.unuse('move');
    }
  })

  onUpdate(() => {
    every("obs", (t) => {
      if(Game.state.over){
        t.unuse('move');
      }
    })
  })
})

scene('game over', () => {
  let tl = add([
    text('GAME OVER', {
      transform: (idx, ch) => ({
        color: hsl2rgb(wave(0.95, 1, time() * 4), 1, wave(0.3, 0.5, time() * 2) ), 
        pos: vec2(0, wave(-2, 2, time() * 1.5 + idx )),
        angle: wave(-15, 15, time() * 1.5 + idx),
      })
    }),
    scale(5),
    pos(width()/2, height()/6),
    origin('center'),
  ])
  let b = add([
    text('MAIN MENU', {
      transform: (idx, ch) => ({
        // color: hsl2rgb(0, 0, wave(0.5, 1, time() * 2)), 
        // pos: vec2(0, wave(-1, 1, time() * 4 * 0.5 + idx)),
        angle: wave(-9, 9, time() * 2.5 + idx),
      })
    }),
    scale(2),
    area({scale: 3}),
    color(200, 40, 40),
    pos(width()/2, height()/1.2),
    origin('center'),
  ])
  b.onClick(() => {
    go('main')
  })
})

go('main')
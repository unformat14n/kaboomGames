import kaboom from "https://unpkg.com/kaboom/dist/kaboom.mjs";
import loader from "./loader.js";
import patrol from "./patrol.js";

kaboom({
  background: [0,0,0],
  crisp: true,
  width: 840,
  height: 420,
})

loader();

function fakeBody(){
  return {
    id: 'fakeBody',
    require: ['body'],
    add(){
    },
    update(){
      if(this.grounded()){
        if(this.is('body')){
          this.unuse('body')
        }
      }
      if(!this.is('body')){
        this.unuse('fakeBody');
      }
    }
  }
}

const GAME = {
  maps: {
    1: [
      "                                                                                                                                               ",
      "                                                                                                                                               ",
      "                                                                                                                                               ",
      "                                                        =                                                                                      ",
      "                                                     =     =                      ^    ^ ^                                                     ",
      "                                                    ==                           ===  =====     k                                             d",
      "                            ^^     ^   c       ^^ ====        =    ^^ ^^    ===            ==========                       c       ^    ======",
      "                   k      ======  ===  =  =  =========           =========                                   b          ========  =====        ",
      "========================                                                                             =================                         ",
    ],
    2: [
      "                                                                                                                                               ",
      "                                                                                                                                               ",
      "                                                                                                                                               ",
      "                                                                                                                                               ",
      "                                                                                  ^    ^ ^                                                     ",
      "                                                                                 ===  =====     k                                             d",
      "                                   ^             ck     s    s    ^  k  ^   ===            ==========                       c       ^    ======",
      "       ^^  ^^     k       ^^  ^^  ===        =========  =    =   =========                                   b          ========  =====        ",
      "=======================  ========      ====                                                          =================                         ",
    ]
  },
  opts: {
    width: 45,
    height: 45,
    "=": () => [
      sprite('tile1'),
      scale(2),
      area(),
      solid(),
    ],
    "^": () => [
      sprite('spikes'),
      scale(2),
      area({width: 20, height: 10, offset: vec2(5, 30)}),
      solid(),
      "hazard",
    ],
    "d": () => [
      sprite('door'),
      scale(2),
      area(),
      solid(),
      "door",
    ],
    "k": () => [
      sprite('knife', {anim: 'walking'}),
      scale(2),
      area({width: 10, height: 20}),
      // solid(),
      body(),
      fakeBody(),
      patrol(120, 100),
      origin('center'),
      'foo'
    ],
    "c": () => [
      sprite('chef', {anim: 'idle'}),
      scale(2),
      area({width: 20, height: 20}),
      patrol(120, 300),
      origin('center'),
      'foo'
    ],
    "b": () => [
      sprite('bean', {anim: 'idle'}),
      scale(2),
      area({width: 20, height: 20}),
      patrol(300, 300),
      origin('center'),
      'foo'
    ],
    "s": () => [
      sprite('spring', {anim: 'idle'}),
      scale(2),
      area(),
      solid(),
      origin('topleft'),
      'spring',
    ]
  }
}

scene('play', (lvl) => {
  const player = add([
    sprite('red-chili',),
    scale(2),
    area({width: 10, height: 18}),
    body(),
    health(3),
    pos(2800  , height()/2),
    origin('center'),
    z(10),
    {
      jump_force: 580,
      speed: 200,
      run: false,
      idle: false,
      fall: false,
      hit: false,
      dir: 1,
      invincibility: false,
      death: false,
      knockback: 1,
    }
  ]);

  const level = addLevel(GAME.maps[`${lvl}`], GAME.opts)

  let t = 0;
  player.onUpdate(() => {
    handleAnims();

    if(!player.death && !player.invincibility) player.hidden = false;
    if(player.hit && !player.death) player.move(player.speed * player.knockback, 0);

    if(!player.grounded()){
      player.fall = true;
    }
    if(player.grounded()){
      player.fall = false;
    }

    if(player.pos.x > 422){
      camPos(player.pos.x, 210)
    }
    if(player.pos.y > 600){
      go('game_over', lvl)
    }

    if(player.invincibility && !player.death) {
      t+=dt();
      if(t > 0.06){
        player.hidden = !player.hidden;
        wait(0.00000001, () => t=0)
      }
    }
  })

  onKeyDown('left', () => {
    if(!player.hit && !player.death){
      player.run = true;
      player.move(-player.speed, 0);
      player.flipX(true);
    }
    player.dir = -1;
  })
  onKeyDown('right', () => {
    if(!player.hit && !player.death){
      player.run = true;
      player.move(player.speed, 0);
      player.flipX(false);
    }
    player.dir = 1;
  })
  onKeyRelease(['left', 'right'], () => {
    player.run = false;
  })
  onKeyPress('space', () => {
    if(player.grounded() && !player.death){
      player.jump(player.jump_force);
    }
  })

  player.onCollide('foo', (f) => {
    if(!player.death && !player.invincibility && !player.hit){
      player.hit = true;
      player.invincibility = true;
      player.hurt(1);
      player.knockback = f.pos.x > player.pos.x ? -1 : 1;
    }
  })
  player.onCollide('hazard', (h) => {
    if(!player.death && !player.invincibility && !player.hit){
      player.hit = true;
      player.invincibility = true;
      player.hurt(1);
      player.knockback = player.dir > 0 ? -1 : 1;
    }
  })
  player.onCollide('door', (d) => {
    go('play', lvl+1)
  })

  player.onGround((l) => {
    if(l.is('spring')){
      l.play('used');
      wait(0.2, () => l.play('idle'));
      player.jump(player.jump_force*1.5)
    }
  })

  player.onDeath(() => {
    player.death = true;
    wait(0.4, () => go('game_over', lvl));
  })
  
  const handleAnims = () => {
    const anim = player.curAnim();
    if(player.death){
      if(anim !== 'death'){
        player.play('death');
      }
    }
    else if(player.hit){
      if(anim !== 'hurt'){
        player.play('hurt');
        wait(0.35, () => player.hit = false);
        wait(1, () => player.invincibility = false)
      }
    }
    else if(player.fall){
      if(anim !== 'fall'){
        player.play('fall');
      }
    }else if(player.run){
      if(anim !== 'run'){
        player.play('run');
      }
    }else {
      if(anim !== 'idle'){
        player.play('idle');
      }
    }
  }
})

scene('game_over', (lvl) => {
  const m = play('go', {volume: 0.1});
  const s = add([
    sprite('go'),
    scale(6),
    pos(width()/2, height()/2),
    origin('center'),
  ])
  const txt = add([
    text('GAME OVER!', 
    {
      size: 60,
      font: 'sinko', 
      transform: (idx, ch) => ({
        // color: hsl2rgb((time() * 0.2 + idx * 0.1) % 1, 0.7, 0.8),
        pos: vec2(0, wave(-4, 4, time() * 4 + idx * 0.5)),
        scale: wave(1, 1.1, time() * 3 + idx),
        // angle: wave(-9, 9, time() * 3 + idx),
      }),
    }),
    color(230, 50, 50),
    pos(width()/2, height()/8),
    origin("center")
  ])

  onKeyPress(() => {
    m.stop();
    go('play', lvl)
  })
})

go('play', 2);
focus()
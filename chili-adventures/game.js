import kaboom from "https://unpkg.com/kaboom/dist/kaboom.mjs";
import loader from "./loader.js";
import patrol from "./patrol.js";
import shoot from "./shoot.js";
import spawnClouds from "./spawnClouds.js";
// import eat from "./eat.js";

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
  levels: {
    maps: {
      1: [
        "                                                                                                                                               ",
        "                S                                                                                                                              ",
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
        "                                                                                                                        =                      ",
        "                 S                                                                                                     =                       ",
        "                                                                                  ^      f                 b        f =    =               f d ",
        "                                                                                 ===  =====     k    ==================     =       ===========",
        "                                   ^             ck     s    s    ^  k  ^   ===            ==========                          s               ",
        "       ^^  ^^     k       ^^  ^^  ===        =========  =    =   =========                                                   ===               ",
        "=======================  ========      ====                                                                                                    ",
      ],
      3: [
        "                                                                                                                                              ",
        "                M                                                                                                                  ^  ^   f    ",
        "                                                                                                                               =============   ",
        "                                                                       s      f                                       s      ==                ",
        "                                                                       =   =  =      c                f  ^    k   ^ f =    ==           c    f ",
        "                                                            =                    ===  =====          ==================             ===========",
        "                   c               ^   =  =         f   s        ^^ s                        =  =  =                         d     =           ",
        "    ^^  ^^  f   =======    ^^ ^^  ===        =========  =      ======                                                        === =             ",
        "==============           ========                                                                                                              ",
      ],
      4: [
        "                                                                                                                                               ",
        "                                                                                                                                               ",
        "                   m                                                                                                                           ",
        "         f                                      ==                      b                                                   c                  ",
        "       ====                    ==           =  ===                 =====                                             f   =======               ",
        "      ==                      ===          ==  ===              f                             f  =             ========                        ",
        "     ===                     =====  ^ ^   ===  ===      ======  =               c    ^ ^  =====  =         ==                                  ",
        "    ====       s      k     ======  = =  ====  ===                              f    = =         =     k                             b        d",
        "================  ===========================  ======================     =====================  =============                   ========  =  =",
      ]
    },
    music: {
      1: 'lvl1',
      2: 'lvl2',
      3: 'lvl3',
      4: 'lvl4',
    },
    bg: {
      1: [51, 182, 255],
      2: [128, 144, 255],
      3: [25, 51, 184],
      4: [55, 65, 109],
    }
  },
  chars: ['red_chili', 'g_chili', 'mr_chili'],
  layers: ['bg', 'enviro', 'game', 'fx', 'ui'],
  lvl_opts: {
    width: 45,
    height: 45,
    "=": () => [
      sprite('tile1'),
      scale(2),
      area(),
      solid(),
      layer('enviro'),
      z(5),
    ],
    "S": () => [
      sprite('sun'),
      scale(3),
      fixed(),
      opacity(0.7),
      z(3),
      layer('bg'),
    ],
    "m": () => [
      sprite('m1'),
      scale(3),
      fixed(),
      opacity(0.7),
      z(3),
      layer('bg'),
    ],
    "M": () => [
      sprite('m2'),
      scale(3),
      fixed(),
      opacity(0.7),
      z(3),
      layer('bg'),
    ],
    "^": () => [
      sprite('spikes'),
      scale(2),
      area({width: 20, height: 10, offset: vec2(5, 30)}),
      solid(),
      "hazard",
      z(5),
      layer('enviro'),
    ],
    "d": () => [
      sprite('door'),
      scale(2),
      area(),
      solid(),
      "door",
      z(5),
      layer('enviro'),
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
      'foo',
      z(5),
      layer('enviro'),
    ],
    "c": () => [
      sprite('chef', {anim: 'idle'}),
      scale(2),
      area({width: 20, height: 20}),
      patrol(120, 300),
      origin('center'),
      'foo',
      z(5),
      layer('enviro'),
    ],
    "b": () => [
      sprite('bean', {anim: 'idle'}),
      scale(2),
      area({width: 20, height: 20}),
      patrol(300, 300),
      origin('center'),
      'foo',
      z(5),
      layer('enviro'),
    ],
    "s": () => [
      sprite('spring', {anim: 'idle'}),
      scale(2),
      area(),
      solid(),
      origin('topleft'),
      'spring',
      z(5),
      layer('enviro'),
    ],
    "f": () => [
      sprite('fire_thrower'),
      scale(2),
      area(),
      solid(),
      shoot(3),
      'machine',
      z(5),
      layer('enviro'),
    ],
    // "e": () => [
    //   sprite('eater'),
    //   scale(2),
    //   area(),
    //   solid(),
    //   eat(2),
    //   'eater',
    //   {
    //     danger: false,
    //     idle: true,
    //   }
    // ],
  }
}

scene('play', (lvl, chili) => {
  layers(GAME.layers);

  spawnClouds(GAME.levels.bg[lvl]);

  every('cloud', (c) => {
    if(c.pos.x < 2){
      c.destroy();
    }
  })

  const bg = add([
    rect(width(), height()),
    pos(width()/2, height()/2),
    origin('center'),
    color(GAME.levels.bg[`${lvl}`][0],GAME.levels.bg[`${lvl}`][1], GAME.levels.bg[`${lvl}`][2]),
    fixed(),
    layer('bg'),
  ])

  const music = play(GAME.levels.music["" + lvl], {loop: true, volume: 0.07});

  const player = add([
    sprite(GAME.chars[chili]),
    scale(2),
    area({width: 10, height: 18}),
    body(),
    health(3),
    pos(100, height()/2),
    origin('center'),
    layer('game'),
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

  const level = addLevel(GAME.levels.maps[`${lvl}`], GAME.lvl_opts);

  for(let i=0; i<player.hp(); i++){
    add([
      sprite('life'),
      scale(3),
      pos(20 + 15*i, 30),
      z(20),
      origin('center'),
      layer('ui'),
      'hp',
      fixed(),
    ])
  }

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
      music.stop();
      go('game_over', lvl, chili)
    }

    if(player.invincibility && !player.death) {
      t+=dt();
      if(t > 0.06){
        player.hidden = !player.hidden;
        wait(0.00000001, () => t=0)
      }
    }

    if(player.hp() < get('hp').length){
      get('hp')[get('hp').length - 1].destroy();
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
      play('jump', {volume: 0.3});
      player.jump(player.jump_force);
    }
  })

  player.onCollide('foo', (f) => {
    if(!player.death && !player.invincibility && !player.hit){
      player.hit = true;
      play('hurt', {volume: 0.3});
      player.invincibility = true;
      player.hurt(1);
      player.knockback = f.pos.x > player.pos.x ? -1 : 1;
    }
  })
  player.onCollide('hazard', (h) => {
    if(!player.death && !player.invincibility && !player.hit){
      player.hit = true;
      play('hurt', {volume: 0.3});
      player.invincibility = true;
      player.hurt(1);
      player.knockback = player.dir > 0 ? -1 : 1;
    }
  })
  player.onCollide('door', (d) => {
    if(lvl == 4){
      music.stop();
      go("win");
    }else {
      music.stop();
      go('play', lvl+1, chili);
    }
  })
  player.onCollide('fireball', (d) => {
    if(!player.death && !player.invincibility && !player.hit){
      player.hit = true;
      d.destroyed = true;
      play('hurt', {volume: 0.3});
      player.invincibility = true;
      player.hurt(1);
      player.knockback = player.dir > 0 ? -1 : 1;
    }
  });

  player.onGround((l) => {
    if(l.is('spring')){
      l.play('used');
      wait(0.2, () => l.play('idle'));
      player.jump(player.jump_force*1.5)
      play('super_jump', {volume: 0.3});
    }
  })

  player.onDeath(() => {
    player.death = true;
    wait(0.4, () => {music.stop(); go('game_over', lvl, chili)});
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

scene('win', () => {
  const s = add([
    sprite('won'),
    scale(6),
    pos(width()/2, height()/2),
    origin('center'),
  ])
  const txt = add([
    text("YOU'VE HELPED CHILI TO ESCAPE FROM THE CHILI EATERS! STAY TUNED FOR MORE LEVELS AND GAMES!", 
    {
      size: 20,
      width: width() - 50,
      font: 'sinko', 
      transform: (idx, ch) => ({
        // color: hsl2rgb((time() * 0.2 + idx * 0.1) % 1, 0.7, 0.8),
        pos: vec2(0, wave(-4, 4, time() * 4 * 0.5)),
        scale: wave(1, 1.1, time() * 3 + idx),
        // angle: wave(-9, 9, time() * 3 + idx),
      }),
    }),
    color(50, 250, 50),
    pos(width()/2, height()/8),
    origin("center")
  ])
})

scene('game_over', (lvl, chili) => {
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
  add([
    text('PRESS ENTER OR SPACE TO PLAY AGAIN', 
    {
      size: 10,
      font: 'sinko',
      width: width() - 20,
    }),
    // color(220, 220, 255),
    pos(width() - 150, height()/1.2),
    origin("center")
  ])
  add([
    text('PRESS BACKSPACE TO GO TO THE MENU', 
    {
      size: 10,
      font: 'sinko',
      width: width() - 20,
    }),
    // color(220, 220, 255),
    pos(width() - 150, height()/1.1),
    origin("center")
  ])
  onKeyPress(['enter', 'space'], () => {
    m.stop();
    go('play', lvl, chili)
  })

  onKeyPress(["backspace"],() => {
    m.stop();
    go('chooseChili')
  })
})

scene('main', () => {
  const music = play('main', {volume: 0.2, loop: true})
  const s = add([
    sprite('main'),
    scale(6),
    pos(width()/2, height()/2),
    origin('center'),
  ])
  const txt = add([
    text('CHILI ADVENTURES: ESCAPE FROM THE CHILI EATERS!', 
    {
      size: 40,
      font: 'sinko',
      width: width() - 20,
      transform: (idx, ch) => ({
        // color: hsl2rgb((time() * 0.2 + idx * 0.1) % 1, 0.7, 0.8),
        pos: vec2(0, wave(-4, 4, time() * 4  * 0.5)),
        // scale: wave(1, 1.1, time() * 3 + idx),
        // angle: wave(-9, 9, time() * 3 + idx),
      }),
    }),
    color(230, 50, 50),
    pos(width()/2, height()/8),
    origin("center")
  ])
  add([
    text('PRESS ENTER OR SPACE TO PLAY', 
    {
      size: 20,
      font: 'sinko',
      width: width() - 20,
      transform: (idx, ch) => ({
        // color: hsl2rgb((time() * 0.2 + idx * 0.1) % 1, 0.7, 0.8),
        pos: vec2(0, wave(-4, 4, time() * 1.5)),
        // scale: wave(1, 1.1, time() * 3 + idx),
        // angle: wave(-9, 9, time() * 3 + idx),
      }),
    }),
    color(220, 220, 255),
    pos(width()/2, height()/1.1),
    origin("center")
  ])
  onKeyPress(['enter', 'space'], () => {
    music.stop();
    go('chooseChili')
  })
})

scene('chooseChili', () => {
  const m = play('choose', {volume: 0.2, loop: true,})
  const CHAR_INFO = ["He's often called Red Chili", 'He comes from Mexico. ARRIBA!', 'Oh, what an elegant chili!'];
  const CHAR_NAMES = ['Tabasco Pepper', 'Poblano Pepper', 'Mr. Tabasco']
  const txt = add([
    text('CHOOSE YOUR CHILI!', {
      size: 40,
      width: width() - 10,
      font: 'sinko',
    }),
    pos(width()/2, height()/8),
    origin('center'),
    // color()
  ]);

  const chili = add([
    sprite('icon', {frame: 0}),
    scale(8),
    origin('center'),
    pos(width()/2, height()/2.5)
  ])
  const info = add([
    text(CHAR_INFO[chili.frame], {size: 20, width: width() - 10, font: 'sinko'}),
    pos(width()/2, 350),
    origin('center'),
  ])
  const name = add([
    text(CHAR_NAMES[chili.frame], {size: 40, width: width() - 10, font: 'sinko'}),
    pos(width()/2, 280),
    origin('center'),
    color(240, 40, 40)
  ])
  onUpdate(() => {
    info.text = CHAR_INFO[chili.frame];
    name.text = CHAR_NAMES[chili.frame]
  })

  onKeyPress('left', () => {
    chili.frame = chili.frame == 0 ? 2 : chili.frame -= 1;
  })
  onKeyPress('right', () => {
    chili.frame = chili.frame == 2 ? 0 : chili.frame += 1;
  })
  onKeyPress('enter', () => {
    m.stop();
    go('play', 1, chili.frame);
  })
})

go('main');
focus()
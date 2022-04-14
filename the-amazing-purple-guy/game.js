// debug.inspect = true;

/*===============================================
=                   Functions                   =
=================================================*/
function patrol(speed, dist, opts){
  let limit = {};
  let dir = -1;
  return {
    id: 'patrol',
    require: ['area', 'pos', 'sprite'],
    add(){
      // debug.log(opts)
      if(opts != undefined){
        if(opts == 'left'){
          limit.min = this.pos.x - dist;
          limit.max = this.pos.x;
        }
      }else {
        limit.min = this.pos.x - dist;
        limit.max = this.pos.x + dist;
      }
    },
    update(){
      // if(type == 'skeleton'){
        if(this.pos.x < limit.min){
          dir = 1;
          this.flipX(false);
        }
        if(this.pos.x > limit.max){
          dir = -1;
          this.flipX(true);
        }
        this.move(speed*dir, 0);
      // }
    }
  }
}
function fakeBody(){
  return {
    id: 'fakeBody',
    require: ['area', 'pos', 'body'],
    add(){
      //nothing :)
    },
    update(){
      if(this.c('body')){
        if(this.isGrounded()){
          this.unuse('body');
        }
      }else {
        this.unuse('fakebody');
      }
    }
  }
}
function shinny(){
  let t = 0;
  return {
    id: 'shinny',
    require: ['pos', 'sprite'],
    add(){
      //nothing :)
    },
    update(){
      if(!this.used && !this.is('coin')){
        t += dt();
        if(t > 3){
          if(this.curAnim() !== "shine"){
            this.play('shine');
          }
        }else {
          if(this.curAnim() !== "on"){
            this.play('on');
          }
        }
      }

      if(this.is('coin')){
        t += dt();
        if(t > 3){
          if(this.curAnim() !== "shine"){
            this.play('shine');
          }
        }else {
          if(this.curAnim() !== "idle"){
            this.play('idle');
          }
        }
      }

      if(this.used && !this.is('coin')){
        if(this.curAnim() !== "off"){
          this.play('off');
        }
      }
      this.onAnimEnd('shine', () => {
        t = 0;
      })
    }
  }
}
function createFX(p, type, value){
  switch(type){
    case 'coin':
      add([
        sprite('coin', {anim: 'shine'}),
        pos(p),
        origin('center'),
        lifespan(0.5, {fade: 0.2}),
        move(UP, 30),
        scale(3),
        layer('ui'),
        // shinny(),
        'coin',
      ])
      break;
    case 'score':
      add([
        text(`${value}`, {size: 20, }),
        pos(p),
        origin('center'),
        lifespan(0.5, {fade: 0.2}),
        move(UP, 30),
        layer('ui'),
      ])
      break;
  }
}
function stalk(speed){
  let offset = 500;
  let obj = get('player')[0];
  // let dir = -1;
  return {
    id: 'stalk',
    require: ['pos', 'sprite', ],
    add(){
      // nothing to do here :)
    },
    update(){
      // this.onExitView(() => {
      //   this.pause = true;
      //   debug.log('outside')
      // })
      if(this.pos.x - offset < obj.pos.x){
        if(!this.destroyed){
          this.moveTo(vec2(obj.pos.x, obj.pos.y - 5), speed);
        }
        if(obj.pos.x > this.pos.x){
          this.flipX(false);
        }else {
          this.flipX(true)
        }
      }
    }
  }
}
function spawnSkull(p, type, dir){
  add([
    layer('fx'),
    // fixed(),
    sprite('sorcerer-skull', {anim: 'idle', flipX: type !== undefined ? (dir == 1 ? true : false) : false}),
    pos(vec2(type !== undefined ? p.x : p.x + width() - 500, p.y)),
    // solid(),
    origin('bot'),
    scale(5),
    // fixed(),
    // origin('center'),
    move(type !== undefined ? dir : LEFT, 550),
    area(),
    "deadly",
    // cleanup()
    lifespan(3),
  ])
  play('s-appear', {volume: 0.3})
}
function checkState(){
  let teleport = false;
  let appear = false;
  let idle = true;
  let atk = false;
  var t = 0;
  return {
    id: 'checkState',
    require: ['pos', 'sprite', 'health'],
    add(){
      //nothing :)

    },
    update(){
      this.onDeath(() => {
        Game.state.play.bossDefeated = true;
        this.death = true;
      })
      if(Game.state.play.bossFight && !this.death){
        const player = get('player')[0];
        const handleAnim = () => {
          if(idle){
            if(this.curAnim() !== 'idle'){
              this.play('idle');
            }
          }else if(atk) {
            if(this.curAnim() !== 'attack'){
              // debug.log('at')
              spawnSkull(this.pos, 'HI', this.dir == 1 ? RIGHT : LEFT);
              this.play('attack', {});
            }
          }else if(appear){
            if(this.curAnim() !== 'appear'){
              // debug.log('a')
              this.play('appear', {onEnd: () => atk = true});
            }
          }
          else {
            if(this.curAnim() !== 'teleport'){
              // debug.log('t')
              this.play('teleport', {onEnd: () => {appear = true; this.pos.x = this.pos.x > player.pos.x ? 5300 : 5800;}});
            }
          }
        }
        handleAnim();
        // const player = get('player')[0];
        if(player.pos.x > this.pos.x){
          this.dir = 1;
          this.flipX(true);
        }else {
          this.dir = -1;
          this.flipX(false);
        }
        if(t < 2){
          idle = true;
          t+=dt();
        }
        if(Math.floor(t) == 2){
          idle = false;
        }
        this.onHurt(() => {
          if(idle){
            t = 2;
            teleport = true;
            idle = false;
          }
        })
        if(teleport || appear){
          this.solid = false;
        }else{
          this.solid = true;
        }
        // debug.log(t);
        this.onAnimStart('teleport', () => {
          teleport = true;
        })
        this.onAnimEnd('teleport', () => {
          // this.pos.x = this.pos.x > player.pos.x ? 5300 : 5800;
          teleport = false;
        })
        this.onAnimEnd('appear', () => {
          // this.pos.x = this.pos.x > player.pos.x ? 5300 : 5800;
          appear = false;
        })
        this.onAnimEnd('attack', () => {
          t=0;
          atk = false;
        })
      }
    }
  }
}
function spawnEnemy(){
  let type = choose(['slime']);
  if(type == 'slime'){
    add([
      sprite('slime', {anim: 'idle'}),
      area({width: 8, height: 4}),
      origin('bot'),
      solid(),
      pos(randi(5400, 5700), 40),
      body(),
      scale(5),
      layer('objects'),
      patrol(80, 50),
      fakeBody(),
      'enemy',
      'dangerous',
      {
        destroyed: false,
      }
    ])
  }else {
    add([
      sprite('bat', {anim: 'idle'}),
      area({width: 6, height: 4}),
      origin('center'),
      solid(),
      pos(randi(5300, 5800), randi(-10, 20)),
      // body(),
      layer('objects'),
      scale(5),
      stalk(70),
      // fakeBody(),
      'enemy',
      'dangerous',
      'bat',
      {
        destroyed: false,
      }
    ])
  }
}
function initialize(){
  Game.state.play.bossFight = false;
  Game.state.score = 0;
  Game.state.play.bossDefeated = false;
}
function achievement(a){
  add([
    text(a.id, {size: 15, width: 300,}),
    pos(width() + 3, 100 + 3),
    color(255, 222, 121),
    layer('ui'),
    z(10),
    lifespan(10),
    fixed(), 
    "not",
    {
      a: 300,
    }
  ])
  add([
    text('NEW ACHIEVEMENT UNLOCKED!', {size: 15, width: 350,}),
    pos(width() + 3, 120),
    layer('ui'),
    z(10),
    lifespan(10),
    fixed(), 
    "not",
    {
      a: 300,
    }
  ])
  add([
    rect(400, 60),
    color(0,0,0),
    outline(5, rgb(255, 255, 255)),
    pos(width(), 100),
    // move(LEFT, 250),
    layer('ui'),
    lifespan(10),
    fixed(),
    "not",
    {
      a: 300,
    }
  ])
  every('not', (n) => {
    // let a = 300;
    n.onUpdate(() => {
      n.move(-n.a, 0);
      n.a -= 2.5;
      // debug.log(a)
    })
  })
}

/*============  End of Functions  =============*/

/*================================================
=                   Constants                   =
=================================================*/

const Game = {
  levels:{
    maps: [
      [
        '                                                                                                                                                     ',
        '                                                                                                                                                     ',
        '                                                                                                                                                     ',
        '                            $                                                                                                                       ⎌',
        '                                 $$$                                                                                                                =',
        '                                  s                                                                                                               =  ',
        '              $             =  =======  ===                            $       $      $$$$  b                    =   $                 b       =     ',
        '                            =             =     s                          g                           ==  =  =                      s      =        ',
        ' ^     s     ====       z   =             ============                ===========  ==========     ⇿                        ⇿     =========           ',
        ' ==========        ==========             ============  =  =   =   =  ===========                                    =                               ',
      ],
      [
        '                   -     ⇿     -                           $                                                                   $                     ',
        '                                   -                       s         $$$$$$                                                                    ⎌     ',
        '                -    s                 -   ---   -   -  -------                                                                ------       ←        ',
        '                  -------  -                 -                 ---    ^ g ^                                                    -      -              ',
        '                              -              -                    ------------                                        b        -        -            ',
        '                        $   $    -    $$$$$  -                                         b             $$$                       -          -          ',
        '       $    $    $                           -                                                                 ^^  g   ^^   -  -             -       ',
        '                       ^  ^         -------  -                                                     ^  s  ^   -------------                      -    ',
        '     ^^  ^^     s   -----------------------  -                                ←                   ---------                   -     ^          -     ',
        '-------------------------------------------  -                                       S         -                               --  ---     ← --      ',
        '                                                                             -   -   -   -  -                                                        ',
      ],
      [
        '                                                                         ^                                                                           ',
        '                                                                        ___   _   _                      S          ^^ S ^^                          ',
        '                                                                     $$$             _        ⎌     s    ^^   s    _________ ^^   ^^        $        ',
        '                                                                    s    s            _       _____________________         _________                ',
        '                                                                  __________  ____     _                                             _               ',
        '                                                                                        _                                             _              ',
        '                                                                                         _                                                  ↑        ',
        '                                                                                   ↑                                                        _        ',
        '                                                     b                             _         ^^  ^                       S                           ',
        '                                                                               ^           _________     s             _   _               ↑         ',
        '   $                 $                         S                   ^^         _____                    _____                  ^  ^      ←  _         ',
        '                             s     s   ________________  _   _   ______     ←                                 s    z       ________                  ',
        '                     s    _____________________________  _   _                                              ___________                              ',
        '_______  _  _  _  _____________________________________  _   _                                                                                       ',
        '                                                                                                                                                     ',
      ],
      [
        '                                                                                                                                                     ',
        '                                                                                                                                                     ',
        '                                    b                                                      ↑    ^^  ^^  ^^  ^^                                       ',
        '                                                                                           □   □□□□□□□□□□□□□□□□                                      ',
        '                                  b                                                                             ^^   s   ^^                          ',
        '                                                                                                               □□□□□□□□□□□□□□                    B   ',
        '                                b                                  b                      ↑                                    □□□□□□□□□□□□□□□□□□□□□□',
        '                       g         s          S                                ^^   ^^   ^^ □                                                          ',
        '       s  S  s     □□□□□□□□□  □□□□□□□□  □  □  □  □     s  ^  s   ^    ^     □□□□□□□□□□□□□□□                                                          ',
        '□□□□□□□□□□□□□□□□□□□                                 □□□□□□□□□□□□□□□□□□□□□□                                                                           ',
        '                                                                                                                                                     ',
        '                                                                                                                                                     ',
        '                                                                                                                                                     ',
        '                                                                                                                                                     ',
        '                                                                                                                                                     ',
      ],
    ],
    opts:  {
      width: 40,
      height: 40,
      "=": () => [
        sprite('tile', {frame: 0}),
        area(),
        solid(),
        layer('environment'),
        scale(5)
      ],
      "-": () => [
        sprite('tiles', {frame: 0}),
        area(),
        solid(),
        layer('environment'),
        scale(5)
      ],
      "□": () => [
        sprite('tiles', {frame: 2}),
        area(),
        solid(),
        layer('environment'),
        scale(5),
        // origin('center')
      ],
      "f": () => [
        sprite('flowers', {frame: randi(0, 3)}),
        layer('fx'),
        scale(5),
        // origin('center')
      ],
      "_": () => [
        sprite('tiles', {frame: 1}),
        area(),
        solid(),
        // origin('bot'),
        layer('environment'),
        scale(5)
      ],
      "^": () => [
        sprite('hazards', {frame: 0}),
        area({width: 5, height: 3, offset: vec2(4, 22)}),
        solid(),
        layer('environment'),
        scale(5),
        origin('topleft'),
        'hazards',
      ],
      "↑": () => [
        sprite('spring', {anim: 'idle'}),
        area({width: 7, height: 8, offset: vec2(0, 22)}),
        solid(),
        layer('environment'),
        scale(5),
        origin('topleft'),
        'spring',
      ],
      "s": () => [
        sprite('slime', {anim: 'idle'}),
        area({width: 8, height: 4}),
        origin('bot'),
        solid(),
        body(),
        scale(5),
        layer('objects'),
        patrol(80, 50),
        fakeBody(),
        'enemy',
        'dangerous',
        'slime',
        {
          destroyed: false,
        }
      ],
      "g": () => [
        sprite('ghost', {anim: 'idle'}),
        area({width: 8, height: 8}),
        origin('center'),
        solid(),
        layer('objects'),
        // body(),
        scale(5),
        patrol(140, 150),
        // fakeBody(),
        'invincible',
        'dangerous',
        {
          destroyed: false,
        }
      ],
      "S": () => [
        sprite('skull', {anim: 'idle'}),
        area({width: 8, height: 8}),
        origin('center'),
        solid(),
        layer('objects'),
        // body(),
        scale(5),
        patrol(250, 240),
        // fakeBody(),
        // 'invincible',
        'dangerous',
        "xtra-dangerous",
        {
          destroyed: false,
        }
      ],
      "b": () => [
        sprite('bat', {anim: 'idle'}),
        area({width: 6, height: 4}),
        origin('center'),
        solid(),
        // body(),
        layer('objects'),
        scale(5),
        stalk(70),
        // fakeBody(),
        'enemy',
        'dangerous',
        'bat',
        {
          destroyed: false,
        }
      ],
      "z": () => [
        sprite('zombie', {anim: 'idle'}),
        area({width: 8, height: 8}),
        origin('bot'),
        solid(),
        body(),
        scale(5),
        patrol(50, 100),
        fakeBody(),
        'dangerous',
        layer('objects'),
        'invincible',
        {
          destroyed: false,
        }
      ],
      "B": () => [
        sprite('boss', {anim: 'idle'}),
        area({width: 20, height: 32}),
        origin('bot'),
        solid(),
        body(),
        scale(3),
        health(5),
        // patrol(50, 100),
        fakeBody(),
        'boss',
        layer('objects'),
        // state('idle', ['idle', 'teleport', 'attack']),
        checkState(),
        // 'invincible',
        {
          death: false,
        }
      ],
      "$": () => [
        sprite('coin-box'),
        area({width: 8, height: 8}),
        origin(vec2(-1.1, 0)),
        solid(),
        scale(4),
        shinny(),
        layer('environment'),
        "box",
        {
          used: false,
        }
      ],
      "⇿": () => [
        sprite('mov-tile', {anim: 'idle'}),
        area({width: 16, height: 4, offset: vec2(0, -14)}),
        origin('bot'),
        solid(),
        scale(5),
        patrol(80, 150),
        layer('environment'),
        // shinny(),
        "moving",
      ],
      "←": () => [
        sprite('mov-tile', {anim: 'idle'}),
        area({width: 16, height: 4, offset: vec2(0, -4)}),
        origin('bot'),
        solid(),
        scale(5),
        patrol(80, 150, 'left'),
        layer('environment'),
        // shinny(),
        "moving",
      ],
      "⎌": () => [
        sprite('portal', {anim: 'idle'}),
        area({width: 8, height: 8}),
        origin(vec2(-0.5, 0.5)),
        // solid(),
        layer('environment'),
        scale(5),
        // patrol(80, 150),
        // shinny(),
        "door",
      ],
    },
    music: ['level1', 'level2', 'level3', 'level4'],
    names: ['CASTLE OF MONSTERS', 'DUNGEONS OF DOOM', 'UNCANNY GARDENS', "THE SORCERE'S LAIR"],
  },
  state: {
    play:
    {
      bossFight: false,
      highscore: 0,
      score: 0,
      coins: 0,
      bossDefeated: false,
      slimes: 0,
    },
  },
  achievements: {
    number: 3,
    "Like Scrooge McDuck": {state: false, condition: {s: 'COLLECT 100 COINS', n: 100}, id: 'LIKE SCROODGE MCDUCK'},
    "Slime Hunter": {state: false, condition: {s: 'KILL 30 SLIMES', n: 30}, id: 'SLIME HUNTER', },
    "Score Master": {state: false, condition: {s: 'SCORE A 1000 IN ONE ATTEMP', n: 1000}, id: 'SCORE MASTER'}
  }
}
const ACHMNTS_NAMES = ["Like Scrooge McDuck", "Slime Hunter", "Score Master"];
const SPEED = 185;
const JUMP_FORCE = 550;
const DISPLACEMENT = 180;
const LAYERS = ['bg', 'environment', 'objects', 'fx', 'ui'];

/* ============  End of Constants  =============*/
scene('main', () => {
  const music = play('main', {volume: 0.3, loop: true})
  add([
    sprite('hand', {anim: 'idle'}),
    pos(width()/1.4, height()/1.5 ),
    scale(15),
    origin('center'),
    {
      dir: 1,
      speed: 20,
    },
    "misc",
  ]);
  add([
    sprite('hand', {anim: 'idle', flipX: true,}),
    pos(width()/3.4, height()/1.49 ),
    scale(15),
    origin('center'),
    {
      dir: 1,
      speed: 20,
    },
    "misc",
  ]);
  add([
    sprite('gem', {anim: 'idle',}),
    pos(width()/2, height()/1.49 ),
    scale(10  ),
    origin('center'),
    {
      dir: 1,
      speed: 10,
    },
    "misc",
  ])
  every('misc', (h) => {
    const limit = {max: h.pos.y + 20, min: h.pos.y - 20}
    h.onUpdate(() => {
      if( h.pos.y > limit.max){
        h.dir = -1
      } 
      if(h.pos.y < limit.min){
        h.dir = 1
      } 
      h.move(0, h.speed*h.dir)
    })
  })
  
  add([
    text('THE AMAZING PURPLE DUDE', {
      size: 50,
    }),
    color(255, 221, 71),
    origin('center'),
    pos(width()/2, height()/4),
    z(10),
  ])
  add([
    rect(300, 50),
    color(0,0,0),
    outline(5, rgb(255, 255, 255)),
    pos(width()/2, 300),
    layer('ui'),
    area(),
    fixed(),
    origin('center'),
    "button",
    {
      scene: 'intro',
    }
  ])
  add([
    text('STORY MODE', {size: 20}),
    pos(width()/2, 300),
    layer('ui'),
    fixed(),
    origin('center'),
  ])
  add([
    rect(300, 50),
    color(0,0,0),
    outline(5, rgb(255, 255, 255)),
    pos(width()/2, 360),
    layer('ui'),
    area(),
    fixed(),
    origin('center'),
    "button",
    {
      scene: 'achievements'
    }
  ])
  add([
    text('ACHIEVEMENTS', {size: 20}),
    pos(width()/2, 360),
    layer('ui'),
    fixed(),
    origin('center'),
  ])

  every('button', (b) => {
    b.onClick(() => {
      music.stop()
      go(b.scene);
    })
  })
})

scene('achievements', () => {
  add([
    text('ACHIEVEMENTS', {size: 30, width: 580}),
    origin('center'),
    pos(width()/2, 40),
    z(10),
    color(255, 222, 121),
  ])
  for(let i=0; i<Game.achievements.number; i++){
    add([
      rect(600, 50),
      color(0,0,0),
      outline(5, rgb(255,255,255)),
      pos(width()/2, 100 + i*80),
      origin('center'),
    ])
    add([
      sprite('achmnts', {frame: i,}),
      origin('center'),
      pos(300, 100+ i*80),
      z('10'),
      scale(4),
      fixed(),
    ])
    add([
      text(Game.achievements[ACHMNTS_NAMES[i]].state ? Game.achievements[ACHMNTS_NAMES[i]].id : 'LOCKED', {size: 20, width: 580}),
      origin('center'),
      pos(width()/2, 90+ i*80),
      z(10),
      color(255, 222, 121),
      fixed(),
    ])
    if(Game.achievements[ACHMNTS_NAMES[i]].state){
      add([
        text(Game.achievements[ACHMNTS_NAMES[i]].condition.s, {size: 10, width: 580}),
        origin('center'),
        pos(width()/2, 110+ i*80),
        z(10),
        fixed(),
      ])
    }
  }
  add([
    text('CLICK OR PRESS ENTER TO GO BACK TO THE MAIN SCREEN', {
      size: 15, 
      // width: width(),
      transform: (idx, ch) => ({
        pos: vec2(0, wave(-3, 3, time() * 5 * 0.5)),
        opacity: wave(1, 0, time() * 8 * 0.3),
      }),
    }),
    opacity(1),
    pos(width() - 400, height()/1.2),
    origin('center'),
    // color(255, 221, 71),
  ])
  onKeyPress('enter', () => {
    // music.stop();
    go('main');
  })
  onClick(() => {
    // music.stop();
    go('main');
  })
})

/*=======================================================================================================================================
=                   SCENE INTRO                   =
=======================================================================================================================================*/
scene('intro', () => {
  add([
    text("IT ALL STARTED WITH A EXPLOSION... A HUGE AND BRIGHT EXPLOSION AT THE KING'S CASTLE. OH THEN... THINGS STARTED TO GET WEIRD, THE WORLD FELL INTO A GREAT DARKNESS, ALL BECAUSE THE SINDICATE OF SORCERERS USED THE PHILOSOPHER'S STONE. IT WAS TOO MUCH POWER, THE STONE WAS FRACTURED, AND EVERY MEMEBER OF THE SINDICATE TOOK ONE PIECE. BUT THERE WAS HOPE, THE HEROES OF EVERY REGION APPEARED TO DEFEAT EVERY SINGLE MEMBER OF THE SINDICATE. THAT'S HOW IT ALL STARTED, WITH ONE OF THE HEROES: PURPLE DUDE, GOING TO THE CASTLE.", {
      size: 25,
      width: width() - 50,
      transform: (idx, ch) => ({
			  pos: vec2(0, wave(-3, 3, time() * 3 * 0.5)),
		  })
    }),
    // color(255, 221, 71),
    origin('center'),
    pos(width()/2, height()/2),
    z(10),
  ])
  add([
    text("PRESS ENTER TO CONTINUE...", {
      size: 15,
      transform: (idx, ch) => ({
        pos: vec2(0, wave(-3, 3, time() * 5 * 0.5)),
        opacity: wave(1, 0, time() * 8 * 0.5),
      }),
    }),
    pos(width() - 500, height() - 100),
    opacity(1),
  ])
  onKeyPress('enter', () => {
    go('play', 1, 0, 0);
  })
})

/*=======================================================================================================================================
=                   SCENE PLAY                   =
=======================================================================================================================================*/

scene('play', (lvl, s, c) => {
  initialize();

  add([
    text(Game.levels.names[lvl-1], {
      size: 80, 
      width: width() - 50,
    }),
    pos(width()/2, height()/4),
    fixed(),
    origin('center'),
    layer('ui'),
    lifespan(2, {fade: 1}),
    // color(127, 86, 243),
  ])
  layers(LAYERS)

  const music = play(Game.levels.music[lvl-1], {loop: true, volume: 0.25})

  const player = add([
    sprite('player', {anim: 'idle'}),
    scale(5),
    pos(3500 , 140),
    origin('bot'),
    body(),
    health(5),
    layer('objects'),
    area({width: 5, height: 8}),
    'player',
    {
      fall: false,
      run: false,
      crouch: false,
      dir: 1,
      kbk: 1,
      teleport: false,
    }
  ])
  const redhb = add([
    rect(400, 20),
		pos(20, 100),
		color(255, 72, 121),
    outline(5, {r:217, g:33, b:61}),
		fixed(),
  ])
  const healthbar = add([
    rect(400, 20),
    outline(5, {r:44, g:180, b:117}),
		pos(20, 100),
		color(127, 255, 127),
		fixed(),
    // origin('center'),
		{
			max: 5,
			set(hp) {
				this.width = 400 * hp / this.max
				this.flash = true
			},
		},
	])

	healthbar.onUpdate(() => {
		if (healthbar.flash) {
			healthbar.color = rgb(255, 255, 255)
      healthbar.outline.color = rgb(255, 255, 255)
			wait(0.1, () => healthbar.flash = false)
		} else {
			healthbar.color = rgb(127, 255, 127)
      healthbar.outline.color = rgb(44, 180, 117)
		}
	})

  if(lvl == 3){
    const decor = addLevel([
        '                                                                                                                                                     ',
        '                                                                                                                                                     ',
        '                                                                                      f           f              f              f                    ',
        '                                                                  f                                                                  f               ',
        '                                                                                        f                                                            ',
        '                                                                                                                                                     ',
        '                                                                                                                                                     ',
        '                                                                                                                                                     ',
        '                                                                                                                       f                             ',
        '                                                                                                       f                                             ',
        '                                        f                f            f                                                                              ',
        '                                f                                                                            f                                       ',
        ' f                      f                                                                                                                            ',
        '                                                                                                                                                     ',
        '                                                                                                                                                     ',
    ], Game.levels.opts)
  }

  const map = addLevel(Game.levels.maps[lvl-1], Game.levels.opts);

  let score = s;
  // let coins = c;
  const coinsImg = add([
    sprite('coin'),
    pos(20, 20),
    fixed(),
    layer('ui'),
    scale(5),
  ])
  const coinsLabel = add([
    text(`${Game.state.play.coins}`, {size: 45,}),
    pos(coinsImg.pos.x + 40, 20),
    fixed(),
    color(255, 255, 255)
  ])
  coinsLabel.onUpdate(() => {
    coinsLabel.text = Game.state.play.coins;
  })
  const scoreLabel = add([
    text(`${score}`, {size: 30,}),
    pos(width() - 100, 20),
    fixed(),
    color(255, 255, 255)
  ])
  scoreLabel.onUpdate(() => {
    scoreLabel.text = score;
  })

  onKeyDown('left', () => {
    if(!player.crouch && !player.hit && !player.teleport){
      player.run = true;
      player.move(-SPEED, 0);
    }
    player.flipX(true);
    player.dir = -1;
  })
  onKeyDown('right', () => {
    if(!player.crouch && !player.hit && !player.teleport){
      player.run = true;
      player.move(SPEED, 0);
    }
    player.flipX(false);
    player.dir = 1;
  })
  onKeyRelease(['left', 'right'], () => {
    player.run = false;
  })
  onKeyDown('down', () => {
    if(!player.hit && !player.teleport){
      player.crouch = true;
      player.area.height = 3;
    }
  })
  onKeyRelease('down', () => {
    player.crouch = false;
    player.area.height = 8;
  })
  onKeyPress('a', () => {
    if(!player.hit && !player.teleport){
      if(player.grounded()){
        play('jump', {volume: 0.3})
        player.jump(JUMP_FORCE);
      }
    }
  })

  player.onGround((l) => {
		if (l.is("enemy")) {
			player.jump(200);
      l.scale.y = 1.5;
      if(!l.destroyed){
        play('e-death', {volume: 0.3});
        createFX(vec2(l.pos.x, l.pos.y - 40), 'score', 100);
      }
      l.unuse('patrol');
      l.destroyed = true;
			wait(0.2, () => destroy(l));
      score += 100;
      if(l.is('slime')){
        Game.state.play.slimes++;
      }
			// addKaboom(player.pos)
			// play("powerup")
		}
	})
  player.onGround((l) => {
		if (l.is("boss")) {
			player.jump(400);
      l.hurt(1);
		}
	})
  player.onGround((l) => {
		if (l.is("invincible")) {
			player.jump(600);
      play('h-jump', {volume: 0.3});
			// wait(0.2, () => destroy(l));
			// addKaboom(player.pos)
			// play("powerup")
		}
	})
  player.onGround((l) => {
		if (l.is("spring")) {
			player.jump(900);
      play('h-jump', {volume: 0.3, speed: 0.55});
      if(l.curAnim() !== 'jump'){
        l.play('jump');
        wait(0.13, () => l.play('idle'))
      }
			// wait(0.2, () => destroy(l));
			// addKaboom(player.pos)
			// play("powerup")
		}
	})
  player.onCollide('dangerous', (d, col) => {
    if(!col.isBottom()){
      player.kbk = player.pos.x > d.pos.x ? 1 : -1;
      if(!player.hit){
        player.hurt(1);
        play('hurt', {volume: 0.3})
      }
    }
  })
  player.onCollide('xtra-dangerous', (d, col) => {
    // if(!col.isBottom()){
      player.kbk = player.pos.x > d.pos.x ? 1 : -1;
      player.hurt(1);
      play('hurt', {volume: 0.3})
    // }
  })
  player.onCollide('deadly', (d, col) => {
    // if(!col.isBottom()){
      player.kbk = player.pos.x > d.pos.x ? 1 : -1;
      player.hurt(10);
      play('hurt', {volume: 0.3})
    // }
  })
  player.onCollide('box', (b, col) => {
    if(col.isTop()){
      if(!b.used){
        createFX(vec2(b.pos.x, b.pos.y - 50), 'coin');
        play('coin', {volume: 0.3})
        b.used = true;
        score+=10;
        Game.state.play.coins++;
      }
    }
  })
  player.onCollide('door', (d) => {
    player.teleport = true;
    player.unuse('body');
  })
  player.onCollide('hazards', (h) => {
    music.stop();
    go('game over', lvl, score, Game.state.play.coins)
  })
  player.onHurt(() => {
    player.hit = true;
    healthbar.set(player.hp());
  })
  player.onAnimEnd('teleport', () => {
    go('play', lvl+1, score, Game.state.play.coins);
    music.stop();
  })
  player.onDeath(() => {
    go('game over', lvl, score, Game.state.play.coins);
    music.stop();
  })

  const handleAnim = () => {
    const anim = player.curAnim();
    if(player.teleport){
      if(anim !== 'teleport'){
        player.play('teleport');
        // wait(0.25, () => player.hit = false)
      }
    }
    else if(player.hit){
      if(anim !== 'hurt'){
        player.play('hurt');
        wait(0.35, () => player.hit = false)
      }
    }
    else if(player.fall){
      if(anim !== 'fall'){
        player.play('fall');
      }
    }else if(player.crouch){
      if(anim !== 'crouch'){
        player.play('crouch');
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

  player.onUpdate(() => {
    handleAnim();
    if(player.is('body')){
      if(!player.isGrounded()){
        player.fall = true;
      }else {
        player.fall = false;
      }
    }
    if(!Game.state.play.bossFight){
      if(player.pos.x > 400){
        camPos(vec2(player.pos.x, 200));
      }else {
        camPos(vec2(390, 200))
      }
    }
    camScale(1)
    // debug.log(player.walk)

    if(lvl == 4 && player.pos.x > 5378){
      Game.state.play.bossFight = true
      camPos(vec2(5379, 200));
    }else {
      camPos(vec2(player.pos.x, 200));
    }

    if(player.hit){
      player.move(player.kbk*DISPLACEMENT, 0);
    }

    if(player.pos.y > 550){
      music.stop();
      go('game over', lvl, score, Game.state.play.coins);
    }
  })
  let t = 0;
  let t1 = 0;
  onUpdate(() => {
    // onError()
    Game.state.play.score = score;
    if(lvl == 4){
      t+=dt();
      if(t >= 4){
        // debug.log('send skull');
        spawnSkull(player.pos)
        wait(0.000001, () => t=0)
      }
    }
    if(Game.state.play.bossDefeated){
      music.stop();
      go('outro')
    }
    if(Game.state.play.coins >= Game.achievements["Like Scrooge McDuck"].condition.n && !Game.achievements["Like Scrooge McDuck"].state){
      achievement(Game.achievements["Like Scrooge McDuck"])
      Game.achievements["Like Scrooge McDuck"].state = true;
    }
    if(Game.state.play.slimes >= Game.achievements['Slime Hunter'].condition.n && !Game.achievements['Slime Hunter'].state){
      achievement(Game.achievements["Slime Hunter"])
      Game.achievements["Slime Hunter"].state = true;
    }
    if(Game.state.play.score >= Game.achievements['Score Master'].condition.n && !Game.achievements['Score Master'].state){
      achievement(Game.achievements["Score Master"])
      Game.achievements["Score Master"].state = true;
    }
  })
})

/*=======================================================================================================================================
=                   GAME OVER SCREEN                                                                                                    =
=======================================================================================================================================*/
scene('game over', (lvl, SCORE, c) => {
  const music = play('game-over', {volume: 0.3,});
  if(Game.state.play.score > Game.state.play.highscore){
    Game.state.play.highscore = Game.state.play.score;
    add([
      text('NEW HIGHSCORE!!', {
        size: 12, 
        transform: (idx, ch) => ({
          pos: vec2(0, wave(3, -3, time() * 2 + idx * 0.5)),
          color: hsl2rgb((time() * 0.2 + idx * 0.1) % 2, 0.7, 0.6),
        })
      }),
      pos(width()/2 - 450, height()/4 + 160),
      z(100),
    ])
  }
  add([
    text('GAME OVER', {size: 80, width: width(),}),
    pos(width()/2, height()/4),
    origin('center'),
    layer('ui'),
    fixed(),
  ])
  add([
    text('YOUR SCORE: ' + SCORE, {size: 30, width: width(),}),
    pos(width()/2 - 150, height()/4 + 100),
    origin('center'),
  ])
  add([
    text('YOUR HIGHSCORE: ' + Game.state.play.highscore, {size: 30, width: width(),}),
    pos(width()/2 - 150, height()/4 + 200),
    origin('center'),
    color(255, 221, 71),
  ])
  add([
    text('CLICK OR PRESS ENTER TO RESTART', {
      size: 15, 
      // width: width(),
      transform: (idx, ch) => ({
        pos: vec2(0, wave(-3, 3, time() * 5 * 0.5)),
        opacity: wave(1, 0, time() * 8 * 0.3),
      }),
    }),
    opacity(1),
    pos(width() - 300, height()/1.2),
    origin('center'),
    // color(255, 221, 71),
  ])
  add([
    text('PRESS BACKSPACE TO GO BACK TO THE MAIN SCREEN', {
      size: 15, 
      // width: width(),
      transform: (idx, ch) => ({
        pos: vec2(0, wave(-3, 3, time() * 5 * 0.5)),
        opacity: wave(1, 0, time() * 8 * 0.3),
      }),
    }),
    opacity(1),
    pos(width() - 300, height()/1.3),
    origin('center'),
    // color(255, 221, 71),
  ])
  onKeyPress('enter', () => {
    music.stop();
    go('play', lvl, 0, c);
  })
  onKeyPress('backspace', () => {
    music.stop();
    go('main');
  })
  onClick(() => {
    music.stop();
    go('play', lvl, 0, c);
  })
})
/*=======================================================================================================================================
=                   OUTRO                                                                                                    =
=======================================================================================================================================*/
scene('outro', () => {
  add([
    text("PURPLE DUDE DEFEATED ONE OF THE SORCERER. HE TOOK THE FRAGMENT OF THE PHILOSOPHER'S STONE AND RAN TO THE PALACE OF THE KING. BUT THE OTHER SORCERERS WERE AWARE OF THAT, PURPLE DUDE WAS NOT THE ONLY HERO IN THE KINGDOM, BUT IT WAS THE FIRST OF THEM WHO DEFEATED A SORCERER. MEANWHILE IN THE SOUTH REGION, A NEW HERO WAS RISING, AND THAT'S HOW A NEW ADVENTURE BEGINS.", {
      size: 25,
      width: width() - 50,
      transform: (idx, ch) => ({
			  pos: vec2(0, wave(-3, 3, time() * 3 * 0.5)),
		  })
    }),
    // color(255, 221, 71),
    origin('center'),
    pos(width()/2, height()/2),
    z(10),
  ])
  add([
    text('CLICK OR PRESS ENTER TO GO BACK TO THE MAIN SCREEN', {
      size: 15, 
      // width: width(),
      transform: (idx, ch) => ({
        pos: vec2(0, wave(-3, 3, time() * 5 * 0.5)),
        opacity: wave(1, 0, time() * 8 * 0.3),
      }),
    }),
    opacity(1),
    pos(width() - 400, height()/1.2),
    origin('center'),
    // color(255, 221, 71),
  ])
  onKeyPress('enter', () => {
    music.stop();
    go('main');
  })
  onClick(() => {
    music.stop();
    go('main');
  })
})
go('main');

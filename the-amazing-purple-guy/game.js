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
        '                            =             =     s                          g                           ==  =  =            g         s      =        ',
        '       s     ====       z   =             ============                ===========  ==========     ⇿                        ⇿     =========           ',
        ' ==========        ==========             ============  =  =   =   =  ===========                                    =                               ',
      ],
      [
        '                   -     ⇿     -                           $                                                                   $                     ',
        '                                   -                       s         $$$$$$                                                                    ⎌     ',
        '                -    s                 -   ---   -   -  -------                                                                ------       ←        ',
        '                  -------  -                 -                 ---    ^ g ^                                                    -      -              ',
        '                              -              -                    ------------                                        b        -        -            ',
        '                        $   $    -    $$$$$$ -                                         b             $$$                       -          -          ',
        '       $    $    $                           -                                                                 ^^  g   ^^   -  -             -       ',
        '                       ^  ^         -------  -                                                     ^  s  ^   -------------                      -    ',
        '     ^^  ^^     s   -----------------------  -                                ←                   ---------                   -     ^          -     ',
        '-------------------------------------------  -                                       S         -                               --  ---     ← --      ',
        '                                                                             -   -   -   -  -                                                        ',
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
      "^": () => [
        sprite('hazards', {frame: 0}),
        area({width: 7, height: 3, offset: vec2(0, 22)}),
        solid(),
        layer('environment'),
        scale(5),
        origin('top'),
        'hazards',
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
        patrol(200, 240),
        // fakeBody(),
        'invincible',
        'dangerous',
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
      "$": () => [
        sprite('coin-box'),
        area({width: 8, height: 8}),
        origin(vec2(-1.5, 0)),
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
        area({width: 16, height: 8}),
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
        area({width: 16, height: 8}),
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
    music: ['level1', 'level2'],
    names: ['CASTLE OF MONSTERS', 'DUNGEONS OF DOOM']
  }
}
const SPEED = 185;
const JUMP_FORCE = 550;
const DISPLACEMENT = 180;
const LAYERS = ['bg', 'environment', 'objects', 'fx', 'ui'];
// const LEVELS = ['THE CASTLE', 'DUNGEONS OF DOOM'];

/* ============  End of Constants  =============*/

scene('play', (lvl, s, c) => {

  // debug.log(lvl);
  // debug.log(debug.fps())

  add([
    text(Game.levels.names[lvl-1], {size: 80,}),
    pos(width()/2, height()/4),
    fixed(),
    origin('center'),
    layer('ui'),
    lifespan(2, {fade: 1}),
    color(127, 86, 243),
  ])
  layers(LAYERS)

  const music = play(Game.levels.music[lvl-1], {loop: true, volume: 0.25})

  const player = add([
    sprite('player', {anim: 'idle'}),
    scale(5),
    pos(100, 140),
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

  const map = addLevel(Game.levels.maps[lvl-1], Game.levels.opts);
  
  let score = s;
  let coins = c;
  const coinsImg = add([
    sprite('coin'),
    pos(20, 20),
    fixed(),
    layer('ui'),
    scale(5),
  ])
  const coinsLabel = add([
    text(`${coins}`, {size: 45,}),
    pos(coinsImg.pos.x + 40, 20),
    fixed(),
    color(255, 255, 255)
  ])
  coinsLabel.onUpdate(() => {
    coinsLabel.text = coins;
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
			// addKaboom(player.pos)
			// play("powerup")
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
  player.onCollide('dangerous', (d, col) => {
    if(!col.isBottom()){
      player.kbk = player.pos.x > d.pos.x ? 1 : -1;
      player.hurt(1);
      play('hurt', {volume: 0.3})
    }
  })
  player.onCollide('box', (b, col) => {
    if(col.isTop()){
      if(!b.used){
        createFX(vec2(b.pos.x, b.pos.y - 50), 'coin');
        play('coin', {volume: 0.3})
        b.used = true;
        score+=10;
        coins++;
      }
    }
  })
  player.onCollide('door', (d) => {
    player.teleport = true;
    player.unuse('body');
  })
  player.onCollide('hazards', (h) => {
    music.stop();
    go('game over', lvl, score, coins)
  })
  player.onHurt(() => {
    player.hit = true;
  })
  player.onAnimEnd('teleport', () => {
    go('play', lvl+1, score, coins);
    music.stop();
  })
  player.onDeath(() => {
    go('game over', lvl, score, coins);
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
    if(player.pos.x > 400){
      camPos(vec2(player.pos.x, 200));
    }else {
      camPos(vec2(390, 200))
    }
    camScale(1)
    // debug.log(player.walk)

    if(player.hit){
      player.move(player.kbk*DISPLACEMENT, 0);
    }

    if(player.pos.y > 550){
      music.stop();
      go('game over', lvl, score, coins);
    }
  })
})
scene('game over', (lvl, SCORE, c) => {
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
  onKeyPress('space', () => {
    go('play', lvl, 0, c);
  })
  onClick(() => {
    go('play', lvl, 0, c);
  })
})
go('play', 1, 0, 0);

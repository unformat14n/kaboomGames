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

function float(){
  const limit = {max: 0, min: 0};
  let dir = -1;
  return {
    id: 'float',
    require: ['pos'],
    add(){
      limit.min = this.pos.y - 1;
      limit.max = this.pos.y + 1;
    },
    update(){
      if(this.pos.y > limit.max){
        dir = -1;
      }
      if(this.pos.y < limit.min){
        dir = 1;
      }
      this.move(0, dir*2);
    }
  }
}

function patrol(type, vel){
  const limit = {min: Number.NEGATIVE_INFINITY, max: Number.POSITIVE_INFINITY};
  const speed = vel;
  let dir = -1;
  return {
    id: 'patrol',
    require: ['area', 'pos', 'sprite'],
    add(){
      if(type == 'skeleton'){
        limit.min = this.pos.x - 100;
        limit.max = this.pos.x + 100
      } 
      if(type == 'skull'){
        limit.min = this.pos.x - 140;
        limit.max = this.pos.x + 140;
      } 
    },
    update(){
      // if(type == 'skeleton'){
        if(this.pos.x < limit.min){
          dir = 1;
          this.flipX(true);
        }
        if(this.pos.x > limit.max){
          dir = -1;
          this.flipX(false);
        }
        this.move(speed*dir, 0);
      // }
    }
  }
}
function shooter(type){
  let range = 0;
  let t = 0;
  return {
    id: 'shooter',
    require: ['area', 'pos', 'sprite'],
    add(){
      if(type == 'ghost'){
        range = this.pos.x - 100;
      } 
    },
    update(){
      t += dt();
      if(t >= this.s){
        t = 0;
        spawnBullet('g-bullet', vec2(this.pos.x, this.pos.y - 10))
      }
    }
  }
}

function deathFX(POS, SCALE = 1){
  add([
    sprite('death-fx', {anim: 'idle'}),
    scale(SCALE),
    pos(POS),
    // color(50, 98, 220),
    opacity(0.7),
    layer('fx'),
    origin('top'),
    lifespan(0.4),
  ])
}
function spawnBullet(type, p){
  const b = add([
    sprite('g-bullet', {anim: 'idle', flipX: true}),
    pos(p),
    area({width: 30, height: 20, offset: vec2(10, 20)}),
    layer('fx'),
    cleanup(),
    color(139, 87, 255),
    lifespan(3, {fade: 2.8}),
    "dangerous",
    {
      destroyed: false,
    }
  ])
  b.onUpdate(() => {
    if(!b.destroyed){
      b.move(-180, 0);
    }
  })
  b.onCollide('hero', () => {
    if(b.curAnim() !== 'destroy'){
      b.play('destroy');
    }
  })
  b.onAnimEnd('destroy', () => {
    b.destroy();
  })
}

const SPEED = 150;
const JUMP_FORCE = 400;
const DISPLACEMENT = -200;
const LAYERS = ['bg', 'fg', 'game', 'player', 'fx'];
const msgs = ['Press SPACE to jump', "Some enemies are capable of shoot. You can duck (press DOWN ARROW) or jump to evade their attacks.", "Beware the enemies. Attack with A. And you oughtn't get too close.", "The fire skulls are powerful demons. Don't try to attack them. Better to dodge. You can not hit them"];
const decorOptions = {
  width: 32,
  height: 41,
  "1": () => [
    sprite('bush1'),
    origin('center'),
    layer('bg'),
    // scale(2),
  ],
  "2": () => [
    sprite('bush2'),
    origin(vec2(0, 0.5)),
    layer('bg'),
    // scale(2),
  ],
  "3": () => [
    sprite('stone1'),
    origin(vec2(0, 0.5)),
    layer('bg'),
    // scale(2),
  ],
  "s": () => [
    sprite('statue'),
    origin(vec2(-1, 0.5)),
    layer('bg'),
    // scale(2),
  ],
  "t": () => [
    sprite('tree1'),
    origin(vec2(0, 0.9)),
    layer('bg'),
    // scale(2),
  ],
  "!": () => [
    sprite('signs'),
    origin(vec2(0, 0.6)),
    layer('bg'),
    area(),
    'sign',
    {
      msg: '',
    }
    // scale(2),
  ],
  "m": () => [
    text('', {size: 10, width: 200, font: 'sinko'}),
    origin('center'),
    layer('bg'),
    float(),
    "message",
  ]
}
const mapOpts = {
  width: 32,
  height: 41,
  // pos: vec2(, 100),
  "=": () => [
    sprite('tiles', {frame: 0}),
    area(),
    solid(),
    layer('fg'),
  ],
  "|": () => [
    rect(32, 41),
    color(0, 0, 32),
    area(),
    solid(),
    layer('fg'),
  ],
  "!": () => [
    rect(10, height()),
    // color(0, 0, 32),
    opacity(0),
    area(),
    solid(),
    layer('fg'),
  ],
  "s": () => [
    sprite('skeleton', {anim: 'walk'}),
    body(),
    fakeBody(),
    area({scale: 0.6, offset: vec2(10, 10)}),
    solid(),
    layer('game'),
    patrol('skeleton', 50),
    "enemy",
    "skeleton",
    {
      death: false,
    }
  ],
  "S": () => [
    sprite('skull', {anim: 'idle'}),
    area({scale: 0.4, offset: vec2(0, 6)}),
    solid(),
    origin('center'),
    layer('game'),
    patrol('skull', 100),
    "skull",
  ],
  "g": () => [
    sprite('ghost', {anim: 'idle', flipX: true}),
    body(),
    shooter('wizard'),
    fakeBody(),
    area({scale: 0.6, offset: vec2(10, 10)}),
    solid(),
    layer('game'),
    // patrol('skeleton', 50),
    "enemy",
    {
      death: false,
      s: 1.5,
    }
  ],
}

scene('play', () => {
  layers(LAYERS);
  gravity(950);
  camScale(2);

  add([
    sprite('bg'),
    scale(4),
    pos(width()/2, height()/2),
    fixed(),
    origin('center')
  ])
  add([
    sprite('fg'),
    scale(7.2, 4),
    pos(width()/2, height() - 200),
    fixed(),
    origin('center')
  ])
  add([
    sprite('fg2'),
    scale(4, 4),
    pos(width()/2, height() - 120),
    fixed(),
    origin('center')
  ])

  const decoration = addLevel([
    "                              m            m                                                               m                               ",
    "                m                                                                                t                                         ",
    "                              !      t     !  2          1                             2                   !        2 2     1       1      ",
    "  1       2   1 !      s  1                                       1       s      1                                                         ",
    "                                                                                                                                           ",
    "                                                                                                                                           ",
  ], decorOptions)
  const map = addLevel([
    "!                                                                                                 s     g                                  ",
    "                                  s                         g                            g ================      S              S          ",
    "                            ============  =====================               s      ======||||||||||||||||==============  ===========     ",
    "===================  =======||||||||||||  |||||||||||||||||||||=======  =============||||||||||||||||||||||||||||||||||||  |||||||||||     ",
    "|||||||||||||||||||  |||||||||||||||||||  ||||||||||||||||||||||||||||  |||||||||||||||||||||||||||||||||||||||||||||||||  |||||||||||     ",
    "            ",
  ], mapOpts)
  // readd("message", () => {});

  const ms = get('message');
  let j = 0;
  for(let i=ms.length - 1; i>=0; i--){
    let m = ms[i];
    m.text = msgs[j];
    j++;
  }

  const hero = add([
    sprite('hero'),
    pos(2000, 50),
    origin('bot'),
    scale(1),
    health(10),
    area({width: 10, height: 30, offset: vec2(5, -10)}),
    body(),
    layer('player'),
    'player',
    'hero',
    {
      walking: false,
      attacking: false,
      fall: false,
      jumping: false,
      crouching: false,
      hit: false,
      dir: 1,
      knockback: 1
    }
  ])
  const swordCollider = add([
    rect(25, 10),
    area(),
    pos(hero.pos),
    opacity(0),
    // follow(hero, vec2(20, -30)),
    "sword",
    {
      attacking: false,
    }
  ])
  swordCollider.onUpdate(() => {
    if(hero.dir == 1){
      swordCollider.pos.x = hero.pos.x + 20;
      swordCollider.pos.y = hero.pos.y - 30;
    }else {
      swordCollider.pos.x = hero.pos.x - 30;
      swordCollider.pos.y = hero.pos.y - 30;
    }
  })

  onKeyDown(['left', 'right'], () => {
    hero.walking = true;
  });
  onKeyDown('left', () => {
    hero.flipX(true);
    hero.dir = -1;
    if(!hero.hit && !hero.attacking && !hero.crouching){
      hero.move(-SPEED, 0)
    }
  })
  onKeyDown('right', () => {
    hero.flipX(false);
    hero.dir = 1;
    if(!hero.attacking && !hero.hit && !hero.crouching){
      hero.move(SPEED, 0)
    }
  })
  onKeyRelease(['left', 'right'], () => {
    hero.walking = false;
  });
  onKeyDown('down', () => {
    if(!hero.fall && !hero.jumping){
      hero.crouching = true;
    }
  })
  onKeyRelease('down', () => {
    hero.crouching = false;
  })

  onKeyPress('a', () => {
    if(!(hero.hit && hero.fall && hero.jumping)){
      hero.attacking = true;
      swordCollider.attacking = true;
    }
  })

  hero.onAnimEnd('attack', () => {
    hero.attacking = false;
    swordCollider.attacking = false;
  })

  hero.onCollide("enemy", (e) => {
    if(e.is('skeleton') || e.is('skull')){
      if(e.dir == -1){
        hero.knockback = -1;
      }else {
        hero.knockback = 1;
      }
    }else{
      if(hero.pos.x > e.pos.x){
        hero.knockback = 1;
      }else {
        hero.knockback = -1
      }
    }
    hero.hurt(1);
  })
  hero.onCollide("dangerous", (e) => {
    if(!e.destroyed){
      hero.hit = true;
      e.destroyed = true;
      hero.hurt(1);
    }
  })
  hero.onCollide("skull", (e) => {
    if(e.dir == -1){
      hero.knockback = -1;
    }else {
      hero.knockback = 1;
    }
    hero.hit = true;
    hero.hurt(1);
  })
  hero.on('hurt', () => {
    hero.hit = true;
  })

  onKeyPress('space', () => {
    hero.jump(JUMP_FORCE);
  })

  every("enemy", (e) => {
    e.onUpdate(() => {
      if(e.isTouching(get('sword')[0])){
        if(get('sword')[0].attacking && !e.death){
          e.death = true;
          wait(0.2, () => destroy(e));
          wait(0.2, () => deathFX(e.pos, 1));
        }
      }
    })
  })

  const handleAnims = () => {
    const curAnim = hero.curAnim();
    if(hero.hit){
      if(curAnim !== 'hurt'){
        hero.play('hurt');
        wait(0.3, () => hero.hit = false)
      }
    }
    else if(hero.fall){
      if(curAnim !== 'fall'){
        hero.play('fall');
      }
    }else if(hero.attacking){
      if(curAnim !== 'attack'){
        hero.play('attack');
      }
    }else if(hero.crouching){
      if(curAnim !== 'crouch'){
        hero.play('crouch');
      }
    }else if(hero.walking){
      if(curAnim !== 'walk'){
        hero.play('walk');
      }
    }else{
      if(curAnim !== 'idle'){
        hero.play('idle');
      }
    }
  }

  hero.onUpdate(() => {
    handleAnims();
    // debug.log(hero.onAnimEnd);
    if(hero.pos.x > 350){
      camPos(vec2(hero.pos.x, 10));
    }else {
      camPos(vec2(350, 10));
    }
    // camPos(hero.pos)

    if(hero.isGrounded()){
      hero.fall = false;
    }else {
      hero.fall = true;
    }

    if(hero.hit){
      hero.move(hero.knockback*DISPLACEMENT, 0);
    }

    if(hero.crouching){
      hero.area.height = 15;
    }else {
      hero.area.height = 30;
    }

    debug.log(hero.knockback)
  })
})

go('play')
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
    },
    update(){
      if(type == 'skeleton'){
        if(this.pos.x < limit.min){
          dir = 1;
          this.flipX(true);
        }
        if(this.pos.x > limit.max){
          dir = -1;
          this.flipX(false);
        }
        this.move(speed*dir, 0);
      }
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
      if(t >= 3){
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
    b.destroyed = true;
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
const DISPLACEMENT = 200;
const LAYERS = ['bg', 'fg', 'game', 'player', 'fx'];

scene('play', () => {
  layers(LAYERS);
  gravity(950)
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

  const map = addLevel([
    "!                                                                        ",
    "                                  s                         g            ",
    "                            ============  =====================          ",
    "===================  =======||||||||||||  |||||||||||||||||||||=======  =",
    "|||||||||||||||||||  |||||||||||||||||||  ||||||||||||||||||||||||||||  |",
    "            ",
  ], {
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
      {
        death: false,
      }
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
      }
    ],
  })

  const decoration = addLevel([
    "                                                 ",
    "                                                 ",
    "                              !      t        2  ",
    "  1       2   1 !      s  1                      ",
    "                                                 ",
    "                                                 ",
  ], {
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
  })

  const hero = add([
    sprite('hero'),
    pos(1500, 50),
    origin('bot'),
    scale(1),
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
      hurt: false,
      dir: 1,
      knockback: 1,
    }
  ])
  const swordCollider = add([
    rect(20, 10),
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
    if(!hero.attacking && !hero.hurt && !hero.crouching){
      hero.move(-SPEED, 0)
    }
  })
  onKeyDown('right', () => {
    hero.flipX(false);
    hero.dir = 1;
    if(!hero.attacking && !hero.hurt && !hero.crouching){
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
    if(!(hero.hurt && hero.fall && hero.jumping)){
      hero.attacking = true;
      swordCollider.attacking = true;
    }
  })

  hero.onAnimEnd('attack', () => {
    hero.attacking = false;
    swordCollider.attacking = false;
  })

  hero.onCollide("enemy", (e) => {
    hero.hurt = true;
  })
  hero.onCollide("dangerous", (e) => {
    hero.hurt = true;
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
      if(e.pos.x < hero.pos.x){
        hero.knockback = 1;
      }else {
        hero.knockback = -1;
      }
    })
  })

  const handleAnims = () => {
    const curAnim = hero.curAnim();
    if(hero.hurt){
      if(curAnim !== 'hurt'){
        hero.play('hurt');
        wait(0.3, () => hero.hurt = false)
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

    if(hero.hurt){
      hero.move(-hero.dir*DISPLACEMENT, 0);
    }

    if(hero.crouching){
      hero.area.height = 15;
    }else {
      hero.area.height = 30;
    }

    // debug.log(camPos())
  })
})

go('play')
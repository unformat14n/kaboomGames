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

const SPEED = 130;
const DISPLACEMENT = 160;
const LAYERS = ['bg', 'fg', 'game', 'player', 'fx']

scene('play', () => {
  layers(LAYERS);
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
    "            ",
    "            ",
    "            s     ",
    "==== ==============",
    "|||| ||||||||||||||",
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
    "s": () => [
      sprite('skeleton', {anim: 'walk'}),
      body(),
      fakeBody(),
      area({scale: 0.6, offset: vec2(10, 10)}),
      solid(),
      layer('game'),
      patrol('skeleton', 50),
      "enemy"
    ],
  })

  const decoration = addLevel([
    "                  ",
    "                  ",
    "                  ",
    "  1       2   1   ",
    "                  ",
    "                  ",
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
  })

  const hero = add([
    sprite('hero'),
    pos(50, 50),
    origin('bot'),
    scale(1),
    area({width: 20, height: 30, offset: vec2(5, -10)}),
    body(),
    layer('player'),
    {
      walking: false,
      attacking: false,
      fall: false,
      jumping: false,
      crouching: false,
      hurt: false,
      dir: 1,
    }
  ])
  const swordCollider = add([
    rect(20, 10),
    area(),
    pos(),
    opacity(0),
    follow(hero, vec2(20, -30)),
    "sword",
    {
      attacking: false,
    }
  ])

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

  onKeyPress('space', () => {
    hero.jump(500)
  })

  every("enemy", (e) => {
    e.onUpdate(() => {
      if(e.isTouching(get('sword')[0])){
        if(get('sword')[0].attacking){
          wait(0.2, () => destroy(e));
          wait(0.2, () => deathFX(e.pos, 1));
        }
        // debug.log('touching')
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
    camPos(vec2(hero.pos.x, 10));
    // camPos(hero.pos)

    if(hero.isGrounded()){
      hero.fall = false;
    }else {
      hero.fall = true;
    }

    if(hero.hurt){
      hero.move(-DISPLACEMENT * hero.dir, 0);
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
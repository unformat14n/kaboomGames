// debug.inspect = true;

/*===============================================
=                   Functions                   =
=================================================*/
function patrol(speed, dist){
  let limit = {};
  let dir = -1;
  return {
    id: 'patrol',
    require: ['area', 'pos', 'sprite'],
    add(){
      limit.min = this.pos.x - dist;
      limit.max = this.pos.x + dist;
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
function createCoin(p){
  add([
    sprite('coin', {anim: 'shine'}),
    pos(p),
    origin('center'),
    lifespan(0.5, {fade: 0.2}),
    move(UP, 30),
    scale(3),
    // shinny(),
    'coin',
  ])
}
function stalk(obj, speed){
  // let dir = -1;
  return {
    id: 'stalk',
    require: ['pos', 'sprite', 'outview'],
    add(){
      // nothing to do here :)
    },
    update(){
      // this.onExitView(() => {
      //   this.pause = true;
      //   debug.log('outside')
      // })
      if(!this.destroyed){
        this.moveTo(obj.pos, speed);
      }
    }
  }
}

/*============  End of Functions  =============*/

scene('play', () => {

  const player = add([
    sprite('player', {anim: 'idle'}),
    scale(5),
    pos(3000, 60),
    origin('bot'),
    body(),
    health(5),
    area({width: 5, height: 8}),
    'player',
    {
      fall: false,
      run: false,
      crouch: false,
      dir: 1,
      kbk: 1,
    }
  ])

  const map = addLevel([
    '                                                                                             ',
    '                                                                                             ',
    '                                                                                             ',
    '                                                                                             ',
    '                            $    $$$                                                         ',
    '                                  s                                                          ',
    '              $             =  =======  ===                            $       $            b',
    '                            =             =     s                          g                 ',
    '       s     ====       z   =             ============                ===========  ==========',
    ' ==========        ==========             ============  =  =   =   =  ===========            ',
  ], {
    width: 40,
    height: 40,
    "=": () => [
      sprite('tiles', {frame: 0}),
      area(),
      solid(),
      scale(5)
    ],
    "s": () => [
      sprite('slime', {anim: 'idle'}),
      area({width: 8, height: 4}),
      origin('bot'),
      solid(),
      body(),
      scale(5),
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
    "b": () => [
      sprite('bat', {anim: 'idle'}),
      area({width: 8, height: 8}),
      origin('center'),
      solid(),
      outview({pause: true}),
      // body(),
      scale(5),
      stalk(player, 70),
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
      'invincible',
      {
        destroyed: false,
      }
    ],
    "$": () => [
      sprite('coin-box'),
      area({width: 8, height: 8}),
      origin('bot'),
      solid(),
      scale(4),
      shinny(),
      "box",
      {
        used: false,
      }
    ],
  })
  let score = 0;
  const scoreLabel = add([
    text(`${score}`, {size: 45, font: 'sink'}),
    pos(20, 20),
    fixed(),
    color(255, 255, 255)
  ])
  scoreLabel.onUpdate(() => {
    scoreLabel.text = score;
  })
  every('bat', (b) => {
    b.onEnterView(() => {
      debug.log('hello');
      b.pause = true;
    })
  })

  onKeyDown('left', () => {
    if(!player.crouch && !player.hit){
      player.run = true;
      player.move(-200, 0);
    }
    player.flipX(true);
    player.dir = -1;
  })
  onKeyDown('right', () => {
    if(!player.crouch && !player.hit){
      player.run = true;
      player.move(200, 0);
    }
    player.flipX(false);
    player.dir = 1;
  })
  onKeyRelease(['left', 'right'], () => {
    player.run = false;
  })
  onKeyDown('down', () => {
    if(!player.hit){
      player.crouch = true;
      player.area.height = 3;
    }
  })
  onKeyRelease('down', () => {
    player.crouch = false;
    player.area.height = 8;
  })
  onKeyPress('a', () => {
    if(!player.hit){
      if(player.grounded()){
        player.jump(500);
      }
    }
  })

  player.onGround((l) => {
		if (l.is("enemy")) {
			player.jump(200);
      l.scale.y = 1.5;
      l.unuse('patrol');
      l.destroyed = true;
			wait(0.2, () => destroy(l));
			// addKaboom(player.pos)
			// play("powerup")
		}
	})
  player.onGround((l) => {
		if (l.is("invincible")) {
			player.jump(600);
			// wait(0.2, () => destroy(l));
			// addKaboom(player.pos)
			// play("powerup")
		}
	})
  player.onCollide('dangerous', (d, col) => {
    if(!col.isBottom()){
      player.kbk = player.pos.x > d.pos.x ? 1 : -1;
      player.hurt(1);
    }
  })
  player.onCollide('box', (b, col) => {
    if(col.isTop()){
      if(!b.used){
        createCoin(vec2(b.pos.x, b.pos.y - 50));
        b.used = true;
        score++;
      }
    }
  })
  player.onHurt(() => {
    player.hit = true;
  })

  const handleAnim = () => {
    const anim = player.curAnim();
    if(player.hit){
      if(anim !== 'hurt'){
        player.play('hurt');
        wait(0.25, () => player.hit = false)
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
    if(!player.isGrounded()){
      player.fall = true;
    }else {
      player.fall = false;
    }
    if(player.pos.x > 390){
      camPos(vec2(player.pos.x, 200));
    }else {
      camPos(vec2(390, 200))
    }
    camScale(2)
    // debug.log(player.walk)

    if(player.hit){
      player.move(player.kbk*150, 0);
    }
  })
})
go('play')

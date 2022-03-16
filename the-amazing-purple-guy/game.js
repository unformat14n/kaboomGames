debug.inspect = true;

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

/*============  End of Functions  =============*/

scene('play', () => {

  const map = addLevel([
    '                           ',
    '                           ',
    '                           ',
    '               s           ',
    ' ========================= ',
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
    ],
  })

  const player = add([
    sprite('player', {anim: 'idle'}),
    scale(5),
    pos(80, 60),
    origin('bot'),
    body(),
    area({width: 5, height: 8}),
    'player',
    {
      fall: false,
      run: false,
      crouch: false,
    }
  ])

  onKeyDown('left', () => {
    if(!player.crouch){
      player.run = true;
      player.move(-200, 0);
    }
    player.flipX(true);
  })
  onKeyDown('right', () => {
    if(!player.crouch){
      player.run = true;
      player.move(200, 0);
    }
    player.flipX(false);
  })
  onKeyRelease(['left', 'right'], () => {
    player.run = false;
  })
  onKeyDown('down', () => {
    player.crouch = true;
    player.area.height = 3;
  })
  onKeyRelease('down', () => {
    player.crouch = false;
    player.area.height = 8;
  })
  onKeyPress('a', () => {
    player.jump(500);
  })

  player.onGround((l) => {
		if (l.is("enemy")) {
			player.jump(200);
      l.scale.y = 1.5;
      l.unuse('patrol');
			wait(0.2, () => destroy(l));
			// addKaboom(player.pos)
			// play("powerup")
		}
	})

  const handleAnim = () => {
    const anim = player.curAnim();
    if(player.fall){
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
      camPos(vec2(player.pos.x, 0));
    }else {
      camPos(vec2(390, 0))
    }
    camScale(2)
    // debug.log(player.walk)
  })
})
go('play')
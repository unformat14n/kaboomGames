scene('play', () => {
  camScale(2);

  const map = addLevel([
    "            ",
    "            ",
    "            ",
    "==== =======",
    "            ",
    "            ",
  ], {
    width: 32,
    height: 41,
    // pos: vec2(, 100),
    "=": () => [
      sprite('tiles', {frame: 0}),
      area(),
      solid(),
    ]
  })

  const hero = add([
    sprite('hero'),
    pos(50, 50),
    origin('bot'),
    scale(1),
    area({width: 20, height: 30, offset: vec2(5, -10)}),
    body(),
    {
      walking: false,
      attacking: false,
      fall: false,
      jumping: false,
      crouching: false,
      hurt: false,
    }
  ])

  onKeyDown(['left', 'right'], () => {
    hero.walking = true;
  });
  onKeyDown('left', () => {
    hero.flipX(true);
    if(!hero.attacking && !hero.hurt && !hero.crouching){
      hero.move(-130, 0)
    }
  })
  onKeyDown('right', () => {
    hero.flipX(false);
    if(!hero.attacking && !hero.hurt && !hero.crouching){
      hero.move(130, 0)
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
    hero.attacking = true;
  })

  hero.onAnimEnd('attack', () => {
    hero.attacking = false;
  })

  onKeyPress('space', () => {
    hero.jump(500)
  })

  const handleAnims = () => {
    const curAnim = hero.curAnim();
    if(hero.fall){
      if(curAnim !== 'fall'){
        hero.play('fall');
      }
    // }else if(hero.jumping){
    //   if(curAnim !== 'jump'){
    //     hero.play('jump');
    //   }
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
    camPos({x: hero.pos.x, y: -20});

    if(hero.isGrounded()){
      hero.fall = false;
    }else {
      hero.fall = true;
    }

    if(hero.crouching){
      hero.area.height = 15;
    }else {
      hero.area.height = 30;
    }

    // debug.log(hero.fall)
  })
})

go('play')
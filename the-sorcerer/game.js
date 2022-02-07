const sorcerer = add([
  sprite('sorcerer', {anim: 'idle'}),
  scale(3),
  origin('center'),
  pos(width()/2, height()/2),
  {
    walking: false,
  }
])

onKeyDown(['left', 'right'], () => {
  sorcerer.walking = true;
})
onKeyRelease(['left', 'right'], () => {
  sorcerer.walking = false;
})

const handleAnimations = () => {
  const curAnim = sorcerer.curAnim();
  if(sorcerer.walking){
    if(curAnim !== 'walk'){
      sorcerer.play('walk');
    }
  }else {
    if(curAnim !== 'idle'){
      sorcerer.play('idle');
    }
  }
}

sorcerer.onUpdate(() => {
  handleAnimations();
})
function handleAnims(player){
  const curAnim = player.curAnim();
  if(player.hit){
    if(player.curAnim !== 'hit'){
      player.play('hit');
    }
  }else if(player.fall){
    if(player.curAnim !== 'fall'){
      player.play('fall');
    }
  }else if(player.jumping){
    if(player.curAnim !== 'jump'){
      player.play('jump');
    }
  }else if(player.slide){
    if(player.curAnim !== 'slide'){
      player.play('slide');
    }
  }else {
    if(player.curAnim !== 'run'){
      player.play('run');
    }
  }
}

export default handleAnims;
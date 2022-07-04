function shoot(interval){
  let t=0;
  return {
    id: 'shoot',
    require: ['pos'],
    add(){

    },
    update(){
      t+=dt()
      if(t > interval){
        this.spawnFireball(vec2(this.pos.x, this.pos.y + 10));
        wait(0.00001, () => t=0);
      }
    },
    spawnFireball(p){
      const f = add([
        sprite('fireball', {anim: 'idle'}),
        pos(p),
        lifespan(1.5, {fade: 0.1}),
        scale(2),
        area({scale: 0.7}),
        origin('center'),
        layer('fx'),
        "fireball",
        {
          destroyed: false,
          t: 0,
        }
      ])
      f.onUpdate(() => {
        t+=dt();
        if(!f.destroyed){
          f.move(-300, 0);
        }
        if(f.destroyed){
          f.destroy();
        }
      })
    }
  }
}
export default shoot;
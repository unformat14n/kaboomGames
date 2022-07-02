function patrol(vel, dist){
  dist = dist ?? 50;
  let dir = 1;
  let limits = {min: 0, max: 0};
  return {
    id: 'patrol',
    require: ['pos', 'sprite'],
    add(){
      limits.min = this.pos.x - dist;
      limits.max = this.pos.x + dist;
    },
    update(){
    //   debug.log(limits.max + ',' + this.pos.x)
      if(this.pos.x > limits.max){
        dir = -1;
        this.flipX(false);
      }
      if(this.pos.x < limits.min){
        dir = 1;
        this.flipX(true);
      }
      this.move(vel*dir, 0);
    }
  }
}
export default patrol;
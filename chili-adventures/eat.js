function eat(interval){
  let t=0;
  return {
    id: 'eat',
    require: ['sprite'],
    add(){
    },
    update(){
      t+=dt();
      if(t >= interval){
        this.idle = false;
        this.timeToEat();
        wait(0.0001, () => t=0);
      }
      if(this.idle && !this.danger){
        if(this.curAnim() !== "idle"){
          this.play('idle');
        }
      }
      this.onAnimEnd("eat", () => {
        wait(0.5, () => {this.danger=false; this.idle=true})
      })
    },
    timeToEat(){
      this.danger = true;
      if(this.curAnim() !== "eat"){
        this.play('eat');
      }
    }
  }
}
export default eat;

export function defEnemyBehaviour(speed = 40){
  let dir = 1;
  let limit = {max: 0, min: 0};
  return {
    id: "enemyBehaviour",
    require: ["pos", "sprite", "area", "body"],
    add() {
      limit = {max: this.pos.x + 50, min: this.pos.x - 50};
    },
    update() {
      if(Math.floor(this.pos.x) > limit.max){
        dir = -1;
        this.flipX(true);
      }
      if(Math.floor(this.pos.x) < limit.min){
        dir = 1;
        this.flipX(false);
      }

      this.move(speed * dir, 0);
    },
  }
}
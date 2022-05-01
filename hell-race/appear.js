function appear(){
  return {
    id: 'appear',
    require: ['opacity'],
    update () {
      this.opacity += dt();
      if(opacity > 1){
        wait(0.1, () => this.unuse('appear'));
      }
    }
  }
}

export default appear;
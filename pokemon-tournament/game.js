// debug.inspect = true;
/*===============================================
=                   Functions                   =
=================================================*/
function createFX(atk, owner, DMG){
  Game.battle.atkAnim = true;
  let dir = owner == 'player' ? false : true;
  if(atk == 'vine-whip-fx'){
    let fx = add([
      sprite(atk, {flipX: dir, anim: 'idle'}),
      scale(5),
      layer('fx'),
      pos(dir == false ? 760 : 400, 70),
      area(),
      "fx",
      {
        dmg: DMG,
      }
    ])
    fx.onAnimEnd("idle", () => {
      fx.destroy();
      Game.battle.atkAnim = false;
      Game.battle.playerTurn = !Game.battle.playerTurn;
    })
  }else if(atk == 'seed-bomb-fx'){
    let fx = add([
      sprite(atk, {flipX: dir}),
      scale(5),
      layer('fx'),
      pos(400, 400),
      area(),
      lifespan(2, {fade: 1}),
      timer(2, () => {Game.battle.atkAnim = false;
        Game.battle.playerTurn = !Game.battle.playerTurn;}),
      origin('bot'),
      "fx",
      {
        dmg: DMG,
        hurt: false,
      }
    ])
    fx.onUpdate(() => {
      if(fx.pos.x > 950){
        fx.hurt = true;
        if(fx.curAnim() !== 'grow'){
          fx.play('grow');
          // fx.scale += 0.5;
        }
        fx.scale.y += 0.2;
        fx.scale.x += 0.2;
        // wait(0.5, () => fx.destroy());
      }else {
        fx.move(900, -280)
      }
    })
  }else if(atk == 'tackle-fx'){
    let fx = add([
      sprite(atk, {anim: 'destroy'}),
      scale(5),
      layer('fx'),
      pos(950, 230),
      area(),
      origin('bot'),
      "fx",
      {
        dmg: DMG,
      }
    ])
    fx.onAnimEnd('destroy', () => {
      fx.destroy();
      Game.battle.atkAnim = false;
      Game.battle.playerTurn = !Game.battle.playerTurn;
    })
  }else if(atk == 'take-down-fx'){
    let fx = add([
      sprite(atk, {anim: 'destroy'}),
      scale(5),
      layer('fx'),
      pos(950, 230),
      area(),
      origin('bot'),
      "fx",
      {
        dmg: DMG,
      }
    ])
    fx.onAnimEnd('destroy', () => {
      fx.destroy();
      Game.battle.atkAnim = false;
      Game.battle.playerTurn = !Game.battle.playerTurn;
    })
  }
}
/*============  End of Functions  =============*/

/*===============================================
=                   Constants                   =
================================================*/
const LAYERS = ['bg', 'bg-misc', 'pokemons', 'fx', 'battle-hud', 'ui'];
const Game = {
  battle: 
  {
    playerTurn: true,
    atkAnim: false,
  }
}
const ATKS = {
  GRASS: {
    SEED_BOMB: {
      id: 'seed-bomb',
      dmg: 5,
      critChance: 2,
    },
    VINE_WHIP: {
      id: 'vine-whip',
      dmg: 8,
      critChance: 5,
    },
  },
  NORMAL: {
    TACKLE: {
      id: 'tackle',
      dmg: 6,
      critChance: 6,
    },
    TAKE_DOWN: {
      id: 'take-down',
      dmg: 8,
      critChance: 3,
    }
  }
}
/*============  End of Constants  =============*/

scene('battle', (pPokemon, ePokemon,) => {
  layers(LAYERS)

  // Add the player's pokemon
  const pokemon = add([
    sprite(pPokemon.name),
    pos(400, 400),
    area(),
    layer('pokemons'),
    scale(3),
    origin('bot'),
    {
      level: pPokemon.lvl,
      moves: pPokemon.moves,
      type: pPokemon.type
    }
  ]);


  // Add the foe's pokemon
  const foe = add([
    sprite(ePokemon.name + '-e'),
    pos(950, 150),
    area(),
    layer('pokemons'),
    scale(3),
    origin('center'),
    health(40)
  ])

  // Add the bases where pokemons will be situated
  add([
    sprite('grass-base'),
    pos(400, 360),
    scale(2),
    layer('bg-misc'),
    origin('center')
  ])
  add([
    sprite('e-grass-base'),
    pos(950, 190),
    layer('bg-misc'),
    scale(2),
    origin('center'),
  ])


  /* Add a square that contains the pokemon movements, the bag, etc. */
  add([
    rect(width() - 50, height()/2),
    pos(25, 380),
    layer('ui'),
    // origin('center'),
    color(192, 214, 220),
    outline(5, {r:100, g:135, b:144})
  ])

  // Add every attack of the player pokemon
  // Every pokemon will have 4 attacks
  for(let i=0; i<pPokemon.atks.length; i++){
    let p = [{x: 50, y: 400}, {x: 450, y: 400},{x: 50, y: 600}, {x: 450, y: 600}];
    const atk = pPokemon.atks[i];
    add([
      sprite(atk.id),
      pos(p[i].x, p[i].y  ),
      layer('ui'),
      scale(3),
      area(),
      "atk",
      {
        dmg: atk.dmg,
        critChance: atk.critChance,
        fx: atk.id + '-fx',
      }
    ]);
  }

  every('atk', (a) => {
    a.onClick(() => {
      if(Game.battle.playerTurn && !Game.battle.atkAnim){
        createFX(a.fx, 'player', a.dmg);
        pokemon.scale.y = 3.3;
        wait(0.4, () => pokemon.scale.y = 3);
        // wait(0.001, () => Game.battle.playerTurn = false);
      }
    })
  })

  foe.onCollide('fx', (fx) => {
    if(!fx.hurt){
      foe.hurt(fx.dmg);
      foe.pos.x = 960
      wait(0.1, () => foe.pos.x = 950);
    }
  })

  let foeatk = undefined;
  onUpdate(() => {
    // debug.log(Game.battle.atkAnim + ', ' + Game.battle.playerTurn);
    if(!Game.battle.playerTurn && !Game.battle.atkAnim){
      // if(foeatk == undefined && !Game.battle.atkAnim){
        foeatk = ePokemon.atks[Math.floor(Math.random()*ePokemon.atks.length)];
        createFX(foeatk.fx, 'foe', foeatk.dmg);
      // }
      // debug.log(foeatk.id);
    }
    debug.log(foeatk.id);
  })
})

go('battle', {name: 'bulbasaur', atks: [ATKS.GRASS.SEED_BOMB, ATKS.GRASS.VINE_WHIP, ATKS.NORMAL.TACKLE, ATKS.NORMAL.TAKE_DOWN]}, {name: 'bulbasaur', atks: [ATKS.GRASS.SEED_BOMB, ATKS.GRASS.VINE_WHIP, ATKS.NORMAL.TACKLE, ATKS.NORMAL.TAKE_DOWN]});
// debug.inspect = true;
const LAYERS = ['bg', 'bg-misc', 'pokemons', 'fx', 'battle-hud', 'ui'];

scene('battle', (pPokemon, ePokemon,) => {
  layers(LAYERS)
  const pokemon = add([
    sprite(pPokemon.type),
    pos(300, 300),
    area(),
    layer('pokemons'),
    scale(3),
  ]);

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

  add([
    rect(width(), height()),
    pos(0, 393),
    layer('ui'),
    color(192, 214, 220),
    outline(5, {r:100, g:135, b:144})
  ])

  const enemy = add([
    sprite(ePokemon.type + '-e'),
    pos(900, 100),
    area(),
    layer('pokemons'),
    scale(3),
  ])
})

go('battle', {type: 'bulbasaur', }, {type: 'bulbasaur', });
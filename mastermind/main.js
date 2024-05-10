import kaboom from 'https://unpkg.com/kaboom@3000.0.1/dist/kaboom.mjs';

kaboom ({
  width: 720,
  height: 540,
  background: [20, 20, 40],
  font: '4x4',
  global: true,
  debug: true,
  canvas: document.querySelector ('#kaboom'),
  degub: true,
});

loadBitmapFont ('4x4', './assets/4x4.png', 4, 4);
loadBitmapFont ('unscii', './assets/unscii_8x8.png', 8, 8);
loadSprite ('bubble', './assets/bubbles.png', {
  sliceX: 4,
  sliceY: 3,
});
loadSprite ('man', './assets/masked_man.png');
loadSound('mastermind', './assets/mastermind_alt.mp3')
loadSound('dlg1', './assets/mask1.mp3')
loadSound('dlg2', './assets/mask2.mp3')
loadSound('dlg3', './assets/mask3.mp3')
loadSound('dlg4', './assets/mask4.mp3')
loadSound('dlg5', './assets/mask6.mp3')
loadSound('dlg6', './assets/mask5.mp3')
loadSound('dlg7', './assets/mask7.mp3')
loadSound('dlg8', './assets/mask8.mp3')
loadSound('dlg9', './assets/mask9.mp3')

// const COLORS = {
//   "blue": 0,
//   "brown": 1,
//   "green": 3,
//   "magenta": 4,
//   "orange": 6,
//   "yellow": 7,
//   "purple": 8,
//   "red": 9,
//   "gray": 10,
//   "empty": 5 jijijijijij
// }
const COLORS = [0, 1, 3, 4, 6, 7, 8, 9, 10, 5];
const NOT_FILLED = 5;

function generateBoard () {
  let y = 20;
  for (let i = 0; i < 8; i++) {
    let x = 40;
    for (let j = 0; j < 4; j++) {
      add ([
        sprite ('bubble', {frame: NOT_FILLED}),
        area (),
        pos (x, y),
        scale (3),
        'bubble',
        {
          row: i,
          col: j,
          fill: -1,
          row_completed: false,
        },
      ]);
      x += width () / 10;
    }
    let btn = add ([
      rect (100, 30),
      color (50, 50, 60),
      outline (5, rgb (40, 40, 50)),
      scale (1),
      area (),
      pos (x, y + 10),
      'check',
      {
        row: i,
      },
    ]);
    btn.add ([
      text ('CHECK', {
        size: 16,
      }),
      pos (10, 8),
      // anchor('center')
    ]);
    y += height () / 12;
  }
}

function getBubblesFrom (row) {
  const bubbles = get ('bubble');
  let r = [];
  for (const b of bubbles) {
    if (b.row == row) {
      r.push (COLORS[b.fill]);
      console.log (b.fill + ' ' + COLORS[b.fill]);
    }
  }
  return r;
}
function setRowCompleted (row) {
  const bubbles = get ('bubble');
  for (const b of bubbles) {
    if (b.row == row) {
      b.row_completed = true;
    }
  }
}

function generateClueRow (row, ans) {
  const r = getBubblesFrom (row);
  console.log (r);
  let y = 35 + height () / 12 * row;
  let x = 60 + width () / 10 * 4;
  let correct = 0;
  for (let j = 0; j < 4; j++) {
    let col = r[j];
    let f = 5;
    if (ans[j] == col) {
      f = 2;
      correct++;
    } else if (ans.includes (col)) {
      f = 6;
    }
    add ([sprite ('bubble', {frame: f}), area (), pos (x, y), scale (2)]);
    x += width () / 16;
  }
  return correct == 4;
}

function answerGuessed () {
  const bubbles = get ('bubble');
  const btns = get ('check');
  for (const b of bubbles) {
    b.row_completed = true;
  }
  for (const btn of btns) {
    btn.destroy ();
  }
}

function createColorSeq () {
  const colors = [0, 1, 3, 4, 6, 7, 8, 9, 10];
  const seq = [];
  const randCols = [];

  // Shuffle the numbers array
  for (let i = colors.length - 1; i > 0; i--) {
    const j = Math.floor (Math.random () * (i + 1));
    [colors[i], colors[j]] = [colors[j], colors[i]];
  }

  // Select 4 unique random numbers
  for (let i = 0; i < 4; i++) {
    while (randCols.includes (colors[i])) {
      colors[i] = colors[Math.floor (Math.random () * numbers.length)];
    }
    seq.push (colors[i]);
    randCols.push (colors[i]);
  }

  return seq;
}

scene ('main', (time) => {
  const music = play("mastermind", {loop: true, volume: 0.5, seek: time})
  generateBoard ();
  const ANSWER = createColorSeq ();
  let curRow = 0;
  const GAME_DIALOGS = [
    'The stakes are high, higher than you can imagine. What if... what if you succeed, and I am left in the darkness alone?',
    'With each failed attempt, the shadows grow thicker around you. How long until they engulf your very soul?',
    'Do you feel it? The weight of your mistakes pressing down like tombstones in the night.',
    'You dance upon the precipice of failure, each step leading you closer to the abyss. How thrilling, to court such danger.',
    'Ah, the taste of desperation. It lingers in the air like a poison, intoxicating and irresistible.',
    'As your moves falter, so too does your resolve. How deliciously fragile the human spirit can be.',
    'With each misstep, you stray further from the light. Will you find your way back, or wander lost in the darkness forever?',
    'The game is but a mirror, reflecting your deepest fears and darkest desires. How thrilling to see them laid bare.',
    'Eight chances, eight opportunities to seal your fate. Will you grasp them, or let them slip through trembling fingers?',
    'Eight tries, eight attempts to prove yourself worthy. But what if... what if you emerge victorious, and I am left to wither in the shadows?',
  ];

  const foe = add ([
    sprite ('man'),
    pos (width () - 125, height () - 130),
    anchor ('center'),
    scale (3),
    state ('breath-in', ['breath-in', 'breath-out', 'laugh']),
    opacity(1)
  ]);
  const DLG_WIN = add ([
    rect (500, 100),
    color (50, 50, 60),
    outline (5, rgb (40, 40, 50)),
    pos (20, height () - 130),
  ]);

  DLG_WIN.add ([
    text ('PLAYMASTER ~', {
      size: 16,
      font: 'unscii',
    }),
    pos (10, 10),
    color (153, 156, 240),
  ]);

  const STARTING_DIALOGS = [
    'In this twisted dance, shadows reign supreme. Brace yourself for the darkness that lurks within.',
    'Behold, as the game unfolds, secrets unfurl like tendrils of night. Dare you face the abyss?',
    'Within the labyrinth of strategy, I am the architect of despair. Prepare for a journey into darkness.',
    'As pawns fall and kings tremble, I wield the power of shadows. Dare you challenge the darkness?',
    'In the realm of strategy, I am the puppeteer of fate. Beware, for every move leads deeper into the abyss.',
    'Shadows whisper secrets as the game commences. Embrace the darkness, for it is my domain.',
    'With each move, we descend further into darkness. Can you navigate the shadows, or will you be consumed?',
    'In the theatre of the macabre, we play a deadly game. Beware the darkness that lies within.',
    'Darkness shrouds the board as we begin our dance. Will you succumb to the shadows, or defy them?',
    'Within the depths of strategy, darkness reigns supreme. Beware, for here there are no heroes, only shadows.',
  ];
  const foe_dlg = DLG_WIN.add ([
    text (
      STARTING_DIALOGS[Math.floor (Math.random () * STARTING_DIALOGS.length)],
      {
        size: 12,
        width: 480,
        font: 'unscii',
      }
    ),
    pos (10, 30),
    color (230, 230, 255),
  ]);

  foe.onStateEnter ('breath-in', async () => {
    await wait (1, () => 
      foe.scaleTo (vec2 (3, 3.1))
    );
    foe.enterState ('breath-out');
  });
  foe.onStateEnter ('breath-out', async () => {
    await wait (1, () => 
      foe.scaleTo (vec2 (3, 3))
    );
    foe.enterState ('breath-in');
  });
  foe.onStateEnter ('laugh', async time => {
    for (let i = 0; i < time; i++) {
      await wait (0.15, () =>
        foe.scaleTo (vec2 (3, 3.2))
      );
      await wait (0.15, () => foe.scaleTo (vec2 (3, 3)));
    }
    foe.enterState ('breath-out');
  });

  console.log(easings)

  // onHover ('bubble', b => {
  //   debug.log (b.row + ' ' + b.col);
  // });
  onHover ('check', btn => {
    if (btn.row == curRow) {
      btn.scale.x = 1.2;
      btn.scale.y = 1.2;
    }
  });
  onHoverEnd ('check', btn => {
    if (btn.row == curRow) {
      btn.scale.x = 1;
      btn.scale.y = 1;
    }
  });

  onClick ('bubble', b => {
    if (b.row == curRow && !b.row_completed) {
      b.fill = b.fill >= COLORS.length - 1? 0 : b.fill + 1;
      b.frame = COLORS[b.fill];
    }
  });
  onClick ('check', async (btn) => {
    if (btn.row == curRow) {
      let result = generateClueRow (btn.row, ANSWER);
      setRowCompleted (btn.row);

      if (result) {
        answerGuessed ();
        foe_dlg.text = "I will watch you from the shadows, my dearest friend..."
        foe.fadeOut(1, easings.easeInOut)
        music.paused = true
        await wait(1.25, () => go('win'));
      } else {
        play(choose([
          'dlg1',
          'dlg2',
          'dlg3',
          'dlg4',
          'dlg5',
          'dlg6',
          'dlg7',
          'dlg8',
          'dlg9',
        ]))
        foe.enterState ('laugh', Math.floor (Math.random () * 10 + 1));
        curRow++;
        foe_dlg.text = GAME_DIALOGS[Math.floor (Math.random () * GAME_DIALOGS.length)];
      }

      btn.destroy ();
    }
  });

  onUpdate(() => {
    if(curRow > 7){
      music.paused = true
      go('lose')
    }
  })
});

scene('win', () => {
  add([
    text('YOU WIN', {
      size: 64,
      font: '4x4'
    }),
    pos(width()/2, height()/8),
    anchor('center'),
    // color(rgb(255, 8, 0))
  ])
  add([
    text('The Playmaster gets consumed by the darkness'.toUpperCase(), {
      size: 14
    }),
    pos(width()/2, height()/5),
    anchor('center'),
    color(rgb(255, 8, 0))
  ])

  const AGAIN = add([
    rect(200, 50),
    pos(width()/2, height()/2),
    anchor('center'),
    scale(1),
    color (50, 50, 60),
    outline (5, rgb (40, 40, 50)),
    area(),
  ])
  AGAIN.add([
    text('PLAY AGAIN?', {
      size: 16
    }),
    pos(-85, -5),
    // anchor('center')
  ])

  AGAIN.onHover (() => {
    AGAIN.scale.x = 1.2;
    AGAIN.scale.y = 1.2;
  });
  AGAIN.onHoverEnd (() => {
    AGAIN.scale.x = 1;
    AGAIN.scale.y = 1;
  });

  AGAIN.onClick(() => {
    go('main')
  })
})

scene('lose', () => {
  add([
    text('YOU LOSE', {
      size: 64,
      font: '4x4'
    }),
    pos(width()/2, height()/8),
    anchor('center'),
    // color(rgb(255, 8, 0))
  ])
  add([
    text('YOUR SOUL IS CONSUMED BY THE DARKNESS'.toUpperCase(), {
      size: 14
    }),
    pos(width()/2, height()/5),
    anchor('center'),
    color(rgb(255, 8, 0))
  ])

  const AGAIN = add([
    rect(200, 50),
    pos(width()/2, height()/2),
    anchor('center'),
    scale(1),
    color (50, 50, 60),
    outline (5, rgb (40, 40, 50)),
    area(),
  ])
  AGAIN.add([
    text('PLAY AGAIN?', {
      size: 16
    }),
    pos(-85, -5),
    // anchor('center')
  ])

  AGAIN.onHover (() => {
    AGAIN.scale.x = 1.2;
    AGAIN.scale.y = 1.2;
  });
  AGAIN.onHoverEnd (() => {
    AGAIN.scale.x = 1;
    AGAIN.scale.y = 1;
  });

  AGAIN.onClick(() => {
    go('main')
  })
})

scene("screen", () => {
  const music = play('mastermind', {volume: 0.5, loop: true})
  add([
    text('MASTERMIND', {
      size: 64,
      font: '4x4'
    }),
    pos(width()/2, height()/8),
    anchor('center'),
    // color(rgb(255, 8, 0))
  ])

  add([
    text('A Deal with the Playmaster'.toUpperCase(), {
      size: 18
    }),
    pos(width()/2, height()/5),
    anchor('center'),
    color(rgb(255, 8, 0))
  ])

  const AGAIN = add([
    rect(125, 50),
    pos(width()/2 - 62, height()/2-25),
    // anchor('center'),
    scale(1),
    color (50, 50, 60),
    outline (5, rgb (40, 40, 50)),
    area(),
  ])
  AGAIN.add([
    text('PLAY', {
      size: 16
    }),
    pos(30, 20),
    // anchor('center')
  ])

  let dir = 1
  AGAIN.onUpdate(() => {
    if (AGAIN.pos.y < height()/2 - 27){
      dir = 1
    }
    if (AGAIN.pos.y > height()/2 - 23){
      dir = -1
    }

    AGAIN.move(0, dir*2.5)
  })

  AGAIN.onHover (() => {
    AGAIN.scale.x = 1.2;
    AGAIN.scale.y = 1.2;
  });
  AGAIN.onHoverEnd (() => {
    AGAIN.scale.x = 1;
    AGAIN.scale.y = 1;
  });

  AGAIN.onClick(() => {
    music.paused = true
    stop()
    go('main', music.time())
  })

  add([
    text('by KENNEYHER', {
      size: 12
    }),
    pos(width() - 150, height() - 25),
    'txt',
    {
      dir: 1
    }
  ])
  add([
    text('Made with [red]KABOOMJS[/red]', {
      size: 12,
      styles:
      {
        "red": {
          color: rgb(255, 69, 50)
        }
      }
    }),
    pos(10, height() - 25),
    'txt',
    {
      dir: 1
    }
  ])
  onUpdate('txt', (t) => {
    if (t.pos.y < height() - 26){
      t.dir = 1
    }
    if (t.pos.y > height() - 24){
      t.dir = -1
    }

    t.move(0, t.dir*1.5)
  })
})

go ('screen');

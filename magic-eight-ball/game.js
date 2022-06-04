import kaboom from "https://unpkg.com/kaboom/dist/kaboom.mjs";
import loader from "./loader.js";

kaboom({
  background: [49,42,62],
  font: 'magicia',
  crisp: true,
})
loader();

function showAnswer(language) {
  if(get('answer').length > 0){
    get('answer')[0].destroy();
  }
  const ANSWERS = {
    english: ['It is certain.', 'It is decidedly so.', 'Reply hazy, try again.', 'Don’t count on it.', 'Without a doubt.', 'Yes definitely.', 'Ask again later', 'My reply is no.', 'You may rely on it.', 'As I see it, yes.', 'Better not to tell you now.', 'My sources say no.', 'Most likely.', 'Outlook good.', 'Cannot predict now.', 'Outlook not so good.', 'Yes.', 'Sigs point to yes', 'Concentrate and ask again', 'Very doubtful.'],
    spanish: ['Es cierto.', 'Es decididamente asi.', 'Respuesta confusa, vuelve a intentarlo.', 'No cuentes con ello.', 'Sin lugar a dudas', 'Si, definitivamente', 'Vuelve a preguntar mas tarde.', 'Mi respuesta es no.', 'Como yo lo veo, si.', 'Puedes contar con ello.', 'Es mejor no decirte ahora.', 'Mis fuentes dicen que no.', 'Es lo mas probable.', 'Predicciones buenas.', 'Las predicciones no son muy buenas.', 'Si.', 'Los signos apuntan al si.', 'Concentrate y vuelve a preguntar.', 'Muy dudoso.'],
  }
  const colors = [[255, 231, 255], [255, 231, 157], [170, 231, 157], [170, 144, 157], [162, 244, 255], [162, 145, 255], [255, 111, 181], [255, 24, 125], [255, 13, 60]]
  let randAns = choose(language == 'eng' ? ANSWERS.english : ANSWERS.spanish);
  let a = add([
    text(language == 'eng' ? `THE MAGIC EIGHT BALL SAYS: ${randAns.toUpperCase()}` : `LA BOLA MAGICA DICE: ${randAns.toUpperCase()}`, 
    {
      size: 30, 
      width: width() - 650,
      transform: (idx, ch) => ({
        pos: vec2(0, wave(-4, 4, time() * 1.5)),
      })
    }),
    pos(600, height()/2),
    z(20),
    color(colors[randi(0, colors.length-1)]),
    opacity(0),
    'answer',
    {
      t: 0,
      l: 4,
      appear: true,
    }
  ])
  a.onUpdate(() => {
    if(a.appear){
      a.opacity += dt();
    }

    if(!a.appear){
      a.t += dt();
      if(a.t >= a.l){
        a.opacity -= dt();
      }
    }

    if(a.opacity >= 1){
      a.appear = false;
    }
    if(a.opacity <= 0 && !a.appear){
      a.destroy();
    }
  })
}

scene('main', () => {
  let language = 'eng';
  const l = add([
    text(language == 'eng' ? `LANGUAGE: ${language.toUpperCase()}` : `IDIOMA: ${language.toUpperCase()}`, {
      size: 20,
    }),
    pos(width() - 100, height() - 30),
    origin('botright'),
    area(),
  ])
  l.onUpdate(() => {
    l.text = `LANGUAGE: ${language.toUpperCase()}`;
  })
  l.onClick(() => {
    if(language == 'eng'){
      language = 'esp';
    }else {
      language = 'eng'
    }
  })

  const h = add([
    text(language == 'eng' ? 'ASK THE MAGIC EIGHT BALL!' : 'PREGUNTALE A LA BOLA OCHO MAGICA', {
      size: 40, 
      transform: (idx, ch) => ({
        pos: vec2(0, wave(-4, 4, time() * 1.5 + idx * 0.8)),
      })
    }),
    pos(width()/2, height()/10),
    origin('center'),
    z(100),
  ])
  h.onUpdate(() => {
    h.text = language == 'eng' ? 'ASK THE MAGIC EIGHT BALL!' : 'PREGUNTALE A LA BOLA OCHO MAGICA';
  })

  const input = add([
    text(language == 'eng' ? 'TYPE SOMETHING' : 'ESCRIBE ALGO', {
      size: 40, 
      width: width() - 50,
      transform: (idx, ch) => ({
        pos: vec2(0, wave(-4, 4, time() * 1.5)),
      })
    }),
    pos(20, height()/6),
    z(80),
    color(223, 224, 255)
  ])

  onCharInput((ch) => {
    input.text += `${ch}`.toUpperCase();
  })
  
  // Delete last character
  onKeyPressRepeat("backspace", () => {
    input.text = input.text.substring(0, input.text.length - 1)
  })

  const ball = add([
    sprite('magic 8 ball'),
    pos(350, height()/1.7),
    origin('center'),
    scale(1),
    {
      dir: 1,
      shake: false,
      t: 0.5,
    }
  ])
  ball.onUpdate(() => {
    // }else {
      if(ball.pos.y < height()/1.5 - 10){
        ball.dir = 1
      }
      if(ball.pos.y > height()/1.5 + 10){
        ball.dir = -1
      }
      ball.move(0, 8*ball.dir)
    // }
  })
  onKeyPress("enter", () => {
    shake(40);
    showAnswer(language);
    wait(2.5, () => input.text = '...')
  })
})

go('main');


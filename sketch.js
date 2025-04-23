// Variables 
let barra, pelota, bloques = [];
let puntuacion = 0;
let vidas = 3;
let nivel = 1;
let juegoIniciado = false; 

// Función que configura el juego al inicio
function setup() {
  createCanvas(380, 400);  // Crea 
  barra = new Barra();      
  pelota = new Pelota();   
  crearBloques(nivel);     
}

// Función que se repite constantemente para dibujar el juego
function draw() {
  background(116, 8, 79);     
  dibujarInterfaz();       

  barra.mostrar();        
  barra.mover();           

  if (juegoIniciado) {
    pelota.actualizar();   // Mueve la pelota solo si el juego comenzó
  }
  pelota.mostrar();        
  pelota.verificarBordes();
  pelota.verificarColisionBarra(barra); 
  pelota.verificarColisionBloques(bloques); 

  bloques = bloques.filter(b => !b.destruido);

  
  if (pelota.fueraDePantalla()) {
    vidas--;             
    juegoIniciado = false;
    pelota.reiniciar();    

    
    if (vidas <= 0) terminarJuego();
  }

  // Si ya no quedan bloques, pasa al siguiente nivel
  if (bloques.every(b => b.indestructible || b.destruido)) {
    nivel++;
    if (nivel > 3) {
      ganarJuego();       
    } else {
      juegoIniciado = false;
      pelota.reiniciar();
      crearBloques(nivel); // Nuevos bloques para el nuevo nivel
    }
  }

  // Muestra todos los bloques restantes
  for (let bloque of bloques) {
    bloque.mostrar();
  }
}












//Presionar la barra espaciadora
function keyPressed() {
  if (key === ' ') {
    juegoIniciado = true;
  }
}

// Dibuja la puntuación, vidas y nivel
function dibujarInterfaz() {
  fill(255);
  textSize(14);
  text(`Puntos: ${puntuacion}`, 10, 20);
  text(`Vidas: ${vidas}`, 320, 20);
  text(`Nivel: ${nivel}`, 170, 20);
}

function terminarJuego() {
  noLoop(); // Detiene el ciclo draw()
  background(0);
  fill(255, 0, 0);
  textSize(32);
  textAlign(CENTER, CENTER);
  text('¡Juego terminado!', width / 2, height / 2);
}

// caso contrario ajua
function ganarJuego() {
  noLoop();
  background(0);
  fill(0, 255, 0);
  textSize(32);
  textAlign(CENTER, CENTER);
  text('¡Ganaste el juego!', width / 2, height / 2);
}






// -------------------------------------------
// CLASE BARRA (controlada por el jugador)
class Barra {
  constructor() {
    this.ancho = 80;
    this.alto = 10;
    this.x = width / 2 - this.ancho / 2;
    this.y = height - 30;
    this.velocidad = 7;
  }

  mover() {
    if (keyIsDown(LEFT_ARROW)) this.x -= this.velocidad; //izq
    if (keyIsDown(RIGHT_ARROW)) this.x += this.velocidad; //der
    this.x = constrain(this.x, 0, width - this.ancho); // No salir del lienzo
  }

  mostrar() {
    fill(255);
    rect(this.x, this.y, this.ancho, this.alto);
  }
}







// -------------------------------------------
// CLASE PELOTA (la bola del juego)
class Pelota {
  constructor() {
    this.radio = 8;
    this.reiniciar(); // Posición y velocidad inicial
  }

  reiniciar() {
    this.pos = createVector(width / 2, height / 2);
    this.vel = createVector(random([-3, 3]), -4 - nivel);
  }

  actualizar() {
    this.pos.add(this.vel);
  }

  mostrar() {
    fill(255);
    ellipse(this.pos.x, this.pos.y, this.radio * 2);
  }

  verificarBordes() {
    if (this.pos.x < 0 || this.pos.x > width) this.vel.x *= -1;
    if (this.pos.y < 0) this.vel.y *= -1;
  }

  fueraDePantalla() {
    return this.pos.y > height;
  }

  verificarColisionBarra(barra) {
    if (
      this.pos.y + this.radio > barra.y &&
      this.pos.x > barra.x &&
      this.pos.x < barra.x + barra.ancho
    ) {
      this.vel.y *= -1;
      this.pos.y = barra.y - this.radio;
    }
  }

  verificarColisionBloques(bloques) {
    for (let bloque of bloques) {
      if (!bloque.destruido &&
          this.pos.x > bloque.x &&
          this.pos.x < bloque.x + bloque.ancho &&
          this.pos.y - this.radio < bloque.y + bloque.alto &&
          this.pos.y + this.radio > bloque.y) {
        this.vel.y *= -1;
        bloque.recibirGolpe();//para que quite
        break; //para que afecte un solo bloque por la colicion
      }
    }
  }
}










// -------------------------------------------
// CLASE BLOQUE (objetivos a romper)
class Bloque {
  constructor(x, y, golpes = 1, indestructible = false) {
    this.x = x;
    this.y = y;
    this.ancho = 36;
    this.alto = 15;
    this.golpes = golpes;
    this.indestructible = indestructible;
    this.destruido = false;
  }

  recibirGolpe() {
    if (!this.indestructible) {
      this.golpes--;
      if (this.golpes <= 0) {
        this.destruido = true;
        puntuacion++; // Suma puntos al destruirse
      }
    }
  }

  mostrar() {
    if (this.destruido) return;
    if (this.indestructible) fill(128); // Gris para bloques indestructibles
    else fill(255 - this.golpes * 60, 150, 200); // Color depende de golpes restantes
    rect(this.x, this.y, this.ancho, this.alto);
  }
}












// -------------------------------------------
// Función que crea bloques dependiendo del nivel
function crearBloques(nivel) {
  bloques = []; //limpia
  let filas = 3 + nivel;

  for (let fila = 0; fila < filas; fila++) {
    for (let col = 0; col < 9; col++) {
      let x = col * 40 + 10;
      let y = fila * 20 + 40;
      let golpes = 1;
      let indestructible = false;

      // Nivel 2: un bloque con 3 golpes
      if (nivel === 2 && fila === 0 && col === 4) golpes = 3; 

      
      // Nivel 3: bloques más duros e indestructibles
      if (nivel === 3) {
        if ((fila === 0 && col === 3) || (fila === 1 && col === 6)) golpes = 3;
        if (fila === 2 && col === 5) indestructible = true;
      }

      bloques.push(new Bloque(x, y, golpes, indestructible));
    }
  }
}

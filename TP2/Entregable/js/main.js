//<----------------------- Canvas ----------------------->
let canvas = document.querySelector('#canvas');
let context = canvas.getContext('2d');
let canvasWidth = canvas.width;
let canvasHeight = canvas.height;

// Fondo canvas
let fondo = new Image();
fondo.src = './imagenes/fondo.jpg';
fondo.onload = clearCanvas;

// Foto casillero vacio
let imgCasilleroVacio = new Image();
imgCasilleroVacio.src = './imagenes/casillerovacio.png';

// Foto de fichas
let fichas;
let fichaimg = new Image();
fichaimg.src = './imagenes/ficha_J1.png';

// Carga el canvas con la imagen de fondo y el tamaño predefinido
function clearCanvas(){
  context.drawImage(fondo, 0, 0, canvas.width, canvas.height);
}

// Timer
// let timeOutTurno = 5;

// Cambiar por JSE6-7 - Modal jugar
$('#jugarModal').modal({backdrop: 'static', keyboard: false})  

//Jugadores
let nombreJ1;
let nombreJ2;
let jugadores = new Array(2);

//Tablero
let tablero;
let columnas = 0;

function imprimirTurno(){
  if (jugadores[0].getTurno()==true) {
    context.textAlign="center";
    context.font="20pt Verdana";
    context.fillStyle = "blue";
    context.fillText("Juega " + nombreJ1, canvas.width/2 ,30);
  }
  else {
    context.textAlign="center";
    context.font="20pt Verdana";
    context.fillStyle = "red";
    context.fillText("Juega " + nombreJ2, canvas.width/2 ,30);
  }
}

function imprimirJugadores(){
   context.textAlign="left";
   context.font="20pt Verdana";
   context.fillStyle = "blue";
   context.fillText(nombreJ1, 10 ,30);
   context.textAlign="right";
   context.font="20pt Verdana";
   context.fillStyle = "red";
   context.fillText(nombreJ2, canvas.width - 10 ,30);
}

function generateFichas(){
  jugadores[0].drawFichitas();
  jugadores[1].drawFichitas();
}

function limpiar(){
  clearCanvas();
  tablero.draw();
}

function drawFichas(){
  limpiar();
  jugadores[0].drawFichitas();
  jugadores[1].drawFichitas();
  imprimirJugadores();
  imprimirTurno();
}

function findClickedFigure(x,y) { //Chequea si clickee una figura
  let fichasjugador;
  if (jugadores[0].getTurno()==true) {
    fichasjugador=jugadores[0].getFichas();
    for (let i = 0; i < fichasjugador.length; i++) {
      if (fichasjugador[i].isPointInside(x,y)){
        return fichasjugador[i];
      }
    }
  }
  else {
    fichasjugador=jugadores[1].getFichas();
    for (let i = 0; i < fichasjugador.length; i++) {
      if (fichasjugador[i].isPointInside(x,y)){
        return fichasjugador[i];
      }
    }
  }
}

let lastClickedFigure = null;
let isMouseDown = false;

function onMouseDown(event){
  isMouseDown = true;
  if (lastClickedFigure != null) {
    lastClickedFigure.setHighlighted(false);
    lastClickedFigure = null;
  }
  let clickedfigure = findClickedFigure(event.layerX, event.layerY);
  if (clickedfigure != null ) {
    clickedfigure.setHighlighted(true);
    lastClickedFigure = clickedfigure;
  }
  drawFichas();
}

function onMouseMoved(event){
  if (isMouseDown && lastClickedFigure != null) {
    lastClickedFigure.setPosition(event.layerX,event.layerY);
    drawFichas();
  }
}

function onMouseUp(){
  isMouseDown = false;
  if (lastClickedFigure != null) {
    let posxficha = lastClickedFigure.getPosX();
    let posyficha = lastClickedFigure.getPosY();
    let caidas = tablero.getCaidas();

    // Se calcula la zona de caida de forma dinamica en relacion a la cantidad de columnas
    let maxValorCaida;
    maxValorCaida = (canvas.width /2 ) + (50 * columnas / 2)
    let minValorCaida;
    minValorCaida = (canvas.width /2 ) - (50 * columnas / 2)

    if ((posyficha > 50 && posyficha < 95) && (posxficha > minValorCaida && posxficha < maxValorCaida)) {
      for (let i = 0; i < caidas.length; i++) {
        if ((posyficha > 50 && posyficha   < 95) && (posxficha > caidas[i].getPosX() && posxficha < caidas[i].getPosX()+49)) {
          let celda=tablero.tirarFicha(i);
          if (celda != null) {
            celda.setFicha(lastClickedFigure);
            lastClickedFigure.setPosition(celda.getPosX()+25,celda.getPosY()+25);
            lastClickedFigure.setUso();
            tablero.checkganador(celda); // Valido por cada caida de fiche si alguien gano
            if (jugadores[0].getTurno()==true) {
              jugadores[0].setTurno(false);
              jugadores[1].setTurno(true);
            }
            else {
              jugadores[1].setTurno(false);
              jugadores[0].setTurno(true);
            }
          }
          else {
            lastClickedFigure.setPosition(lastClickedFigure.getPosXOriginal(),lastClickedFigure.getPosYOriginal());
          }
        }
      }
    }
    else {
      lastClickedFigure.setPosition(lastClickedFigure.getPosXOriginal(),lastClickedFigure.getPosYOriginal());
    }
    drawFichas();
  }
  if (tablero.getGanador() != null) {
    clearCanvas();
    centerX = canvas.width/2;
		context.textAlign="center";

		context.font="60pt Verdana";
		context.fillStyle = "blue";
		context.fillText("GANADOR",centerX,60);

		context.font="40pt Verdana";
		context.strokeStyle="green";
		context.lineWidth = 2;
		context.strokeText(tablero.getGanador(),centerX,120);

    canvas.removeEventListener('mousedown',onMouseDown,false); //ESTOS LISTENER NO SE SI VAN ACA
    canvas.removeEventListener('mouseup',onMouseUp,false);
    canvas.removeEventListener('mousemove',onMouseMoved,false);
  }
}


function newGame(){
  // Asigno el nombre de los jugadores
  nombreJ1 = document.querySelector("#nombreJ1").value;
  nombreJ2 = document.querySelector("#nombreJ2").value;
  // Oculto el modal
  $("#jugarModal").modal('hide');

  // Variables cargadas por input
  let nLineas = document.querySelector("#nLineas").value;

  switch (nLineas) {
    case "4":
      filas = 6;
      columnas = 7;
      break;
    case "5":
      filas = 7;
      columnas = 8;
      break;
    case "6":
      filas = 8;
      columnas = 9;
      break;
    case "7":
      filas = 9;
      columnas = 10;
      break;
  }

  clearCanvas();
  // Dibujar Tablero
  tablero = new Tablero(filas,columnas, imgCasilleroVacio);
  tablero.draw();

  // Crea los jugadores y las fichas
  
  let cantfichas = parseInt((filas*columnas)/2);
  jugadores[0] = new Jugador(nombreJ1,true,cantfichas,"blue",40);
  jugadores[1] = new Jugador(nombreJ2,false,cantfichas,"red",canvasWidth-40);
  jugadores[0].drawFichitas();
  jugadores[1].drawFichitas();
  canvas.addEventListener('mousedown',onMouseDown,false); //ESTOS LISTENER NO SE SI VAN ACA
  canvas.addEventListener('mouseup',onMouseUp,false);
  canvas.addEventListener('mousemove',onMouseMoved,false);
  //alertaTras5seg();
}

document.querySelector("#jugar").addEventListener("click",newGame);
document.querySelector("#nuevoJuego").addEventListener("click", function(){
  $("#jugarModal").modal('show');
});


// Terminar
// function alertaTras5seg() {
//   var timer = timeOutTurno, minutes, seconds;
//   setInterval(function () {
//       minutes = parseInt(timer / 60, 10);
//       seconds = parseInt(timer % 60, 10);

//       minutes = minutes < 10 ? "0" + minutes : minutes;
//       seconds = seconds < 10 ? "0" + seconds : seconds;

//       timeOutTurno = minutes + ":" + seconds;
//       if (--timer < 0) {
//           timer = timeOutTurno;
//       }
//     imprimirJugadores();
//   }, 1000);
// }




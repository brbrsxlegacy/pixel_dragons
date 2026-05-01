const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let tileSize = 80;
let grid = [];
let dragons = [];

// GRID OLUŞTUR
for(let y=0;y<6;y++){
  for(let x=0;x<10;x++){
    grid.push({
      x:x*tileSize+50,
      y:y*tileSize+80,
      type: Math.random()<0.3 ? "habitat" : "grass"
    });
  }
}

// EJDERHALAR
dragons = [
  {x:120,y:200,color:"#ff4d4d"},
  {x:320,y:300,color:"#4dff88"},
  {x:520,y:250,color:"#4da6ff"}
];

// TILE ÇİZ
function drawTile(t){
  if(t.type==="grass"){
    ctx.fillStyle="#6ab04c";
  } else {
    ctx.fillStyle="#c7a66a";
  }
  ctx.fillRect(t.x,t.y,70,70);

  // detay
  if(t.type==="habitat"){
    ctx.fillStyle="#8b5a2b";
    ctx.fillRect(t.x+20,t.y+20,30,30);
  }
}

// EJDERHA
function drawDragon(d){
  ctx.fillStyle=d.color;
  ctx.fillRect(d.x,d.y,30,20);

  // kanat animasyon
  let flap = Math.sin(Date.now()/150)*5;
  ctx.fillRect(d.x+5,d.y-10+flap,20,10);
}

// GÜNEŞ + AĞAÇ
function drawWorld(){
  // gökyüzü
  let g = ctx.createLinearGradient(0,0,0,600);
  g.addColorStop(0,"#79d8ff");
  g.addColorStop(1,"#e6f7ff");
  ctx.fillStyle=g;
  ctx.fillRect(0,0,900,600);

  // güneş
  ctx.fillStyle="#FFD93D";
  ctx.fillRect(780,50,60,60);

  // zemin
  ctx.fillStyle="#6ab04c";
  ctx.fillRect(0,450,900,150);
}

// LOOP
function loop(){
  drawWorld();

  grid.forEach(drawTile);
  dragons.forEach(drawDragon);

  requestAnimationFrame(loop);
}

loop();

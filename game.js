const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

let TILE = 64;
let mode = "island";

let state = {
  gold: 500,
  food: 200,
  gems: 20,
  tiles: [],
  dragons: []
};

// GRID
for(let y=0;y<6;y++){
  for(let x=0;x<10;x++){
    state.tiles.push({
      x:x*TILE+50,
      y:y*TILE+100,
      type:"grass"
    });
  }
}

// EJDERHA
state.dragons.push({
  x:200,
  y:250,
  color:"#ff4d4d"
});

// DRAW
function rect(x,y,w,h,c){
  ctx.fillStyle=c;
  ctx.fillRect(x,y,w,h);
}

function text(t,x,y,c="#000",s=16){
  ctx.fillStyle=c;
  ctx.font=s+"px monospace";
  ctx.fillText(t,x,y);
}

// UI
function drawUI(){
  rect(0,0,1024,60,"#ffffffdd");

  text("Altın: "+state.gold,20,35);
  text("Yemek: "+state.food,200,35);
  text("Elmas: "+state.gems,380,35);

  // MARKET BUTON
  rect(820,10,180,40,"#2ecc71");
  text("MARKET",850,35,"#fff");
}

// TILE
function drawTiles(){
  state.tiles.forEach(t=>{
    if(t.type==="grass"){
      rect(t.x,t.y,TILE,TILE,"#6ab04c");
    }

    if(t.type==="habitat"){
      rect(t.x,t.y,TILE,TILE,"#c7a66a");
      rect(t.x+10,t.y+10,44,44,"#8b5a2b");
    }
  });
}

// EJDERHA
function drawDragon(d){
  let flap=Math.sin(Date.now()/150)*4;

  rect(d.x,d.y,40,20,d.color);
  rect(d.x+10,d.y-10+flap,20,10,"orange");
}

// DÜNYA
function drawWorld(){
  let g=ctx.createLinearGradient(0,0,0,600);
  g.addColorStop(0,"#79d8ff");
  g.addColorStop(1,"#e6f7ff");

  ctx.fillStyle=g;
  ctx.fillRect(0,0,1024,576);

  // güneş
  rect(850,50,50,50,"#FFD93D");

  // zemin
  rect(0,450,1024,126,"#6ab04c");
}

// MARKET
function drawMarket(){
  rect(0,0,1024,576,"#ffffff");

  text("MARKET",450,80,"#000",28);

  // YUVA
  rect(200,150,200,100,"#6ab04c");
  text("Yuva Satın Al",210,200);
  text("100 Altın",210,230);

  // GERİ
  rect(800,20,180,50,"#e74c3c");
  text("GERİ",840,55,"#fff");
}

// CLICK
canvas.onclick=e=>{
  let r=canvas.getBoundingClientRect();
  let mx=(e.clientX-r.left)*1024/r.width;
  let my=(e.clientY-r.top)*576/r.height;

  if(mode==="island"){
    // market
    if(mx>820 && my<60){
      mode="market";
    }

    // tile yerleştirme
    state.tiles.forEach(t=>{
      if(mx>t.x && mx<t.x+TILE && my>t.y && my<t.y+TILE){
        if(state.gold>=100){
          t.type="habitat";
          state.gold-=100;
        }
      }
    });
  }

  else if(mode==="market"){
    // yuva satın alma
    if(mx>200 && mx<400 && my>150 && my<250){
      if(state.gold>=100){
        state.gold-=100;

        // boş tile bul
        let empty = state.tiles.find(t=>t.type==="grass");
        if(empty) empty.type="habitat";
      }
    }

    // geri
    if(mx>800 && my<70){
      mode="island";
    }
  }
};

// LOOP
function loop(){
  drawWorld();

  if(mode==="island"){
    drawTiles();
    state.dragons.forEach(drawDragon);
    drawUI();
  }

  if(mode==="market"){
    drawMarket();
  }

  requestAnimationFrame(loop);
}

loop();

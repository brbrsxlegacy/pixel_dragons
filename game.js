// ===== CANVAS =====
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

// ===== CONFIG =====
const TILE = 64;
const MAP_W = 12;
const MAP_H = 8;

// ===== STATE =====
let state = {
  gold: 500,
  food: 200,
  gems: 10,
  mode: "island",
  cameraX: 0,
  cameraY: 0,
  tiles: [],
  dragons: []
};

// ===== ELEMENT =====
const ELEMENTS = {
  fire: {color:"#ff4d4d"},
  water:{color:"#4da6ff"},
  nature:{color:"#4dff88"}
};

// ===== ISO CONVERT =====
function iso(x,y){
  return {
    x:(x - y) * TILE/2,
    y:(x + y) * TILE/4
  };
}

// ===== GRID CREATE =====
for(let y=0;y<MAP_H;y++){
  for(let x=0;x<MAP_W;x++){
    state.tiles.push({
      gx:x,
      gy:y,
      type:"grass"
    });
  }
}

// ===== DRAGON =====
function createDragon(gx,gy){
  let keys = Object.keys(ELEMENTS);
  let e = keys[Math.random()*keys.length|0];

  return {
    gx, gy,
    element:e,
    level:1,
    anim:0
  };
}

state.dragons.push(createDragon(3,3));

// ===== DRAW UTILS =====
function rect(x,y,w,h,c){
  ctx.fillStyle=c;
  ctx.fillRect(x,y,w,h);
}

function text(t,x,y,c="#000",s=16){
  ctx.fillStyle=c;
  ctx.font=s+"px monospace";
  ctx.fillText(t,x,y);
}

// ===== WORLD =====
function drawWorld(){
  let g = ctx.createLinearGradient(0,0,0,576);
  g.addColorStop(0,"#79d8ff");
  g.addColorStop(1,"#e6f7ff");

  ctx.fillStyle=g;
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // güneş
  rect(900,50,50,50,"#FFD93D");
}

// ===== TILE DRAW =====
function drawTile(tile){
  let p = iso(tile.gx, tile.gy);

  let x = p.x + 512;
  let y = p.y + 100;

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x+32, y+16);
  ctx.lineTo(x, y+32);
  ctx.lineTo(x-32, y+16);
  ctx.closePath();

  ctx.fillStyle = tile.type === "grass" ? "#6ab04c" : "#c7a66a";
  ctx.fill();

  ctx.strokeStyle="#00000022";
  ctx.stroke();

  // habitat üst yapı
  if(tile.type === "habitat"){
    rect(x-12,y+5,24,20,"#8b5a2b");
  }
}

// ===== DRAGON DRAW =====
function drawDragon(d){
  let p = iso(d.gx, d.gy);
  let x = p.x + 512;
  let y = p.y + 80;

  let e = ELEMENTS[d.element];

  d.anim += 0.1;
  let flap = Math.sin(d.anim)*4;

  // gövde
  rect(x-10,y,20,12,e.color);

  // kanat
  rect(x-5,y-8+flap,10,8,"white");

  // göz
  rect(x+5,y+3,2,2,"black");
}

// ===== UI =====
function drawUI(){
  rect(0,0,canvas.width,60,"#ffffffdd");

  text("Altın: "+state.gold,20,35);
  text("Yemek: "+state.food,180,35);
  text("Elmas: "+state.gems,340,35);

  rect(820,10,180,40,"#2ecc71");
  text("MARKET",850,35,"#fff");
}

// ===== CLICK =====
canvas.onclick = e=>{
  let r=canvas.getBoundingClientRect();
  let mx=(e.clientX-r.left)*canvas.width/r.width;
  let my=(e.clientY-r.top)*canvas.height/r.height;

  if(state.mode === "island"){

    // MARKET
    if(mx>820 && my<60){
      state.mode = "market";
      return;
    }

    // TILE SELECT
    state.tiles.forEach(t=>{
      let p = iso(t.gx, t.gy);
      let tx = p.x + 512;
      let ty = p.y + 100;

      if(Math.abs(mx - tx) < 30 && Math.abs(my - ty) < 30){
        if(state.gold >= 100){
          t.type = "habitat";
          state.gold -= 100;

          state.dragons.push(createDragon(t.gx,t.gy));
        }
      }
    });
  }
};

// ===== LOOP =====
function loop(){
  drawWorld();

  if(state.mode === "island"){
    state.tiles.forEach(drawTile);
    state.dragons.forEach(drawDragon);
    drawUI();
  }

  requestAnimationFrame(loop);
}

loop();

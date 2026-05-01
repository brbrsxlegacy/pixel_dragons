const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const goldEl = document.getElementById("gold");
const foodEl = document.getElementById("food");
const gemEl = document.getElementById("gem");

const market = document.getElementById("market");
const marketBtn = document.getElementById("marketBtn");
const closeBtn = document.getElementById("closeBtn");

let W, H;
function resize() {
  W = canvas.width = innerWidth;
  H = canvas.height = innerHeight;
}
resize();
addEventListener("resize", resize);

const TILE_W = 64;
const TILE_H = 32;
const MAP_W = 14;
const MAP_H = 14;

let camX = 0;
let camY = 90;

let gold = 800;
let food = 150;
let gem = 30;
let selected = null;
let time = 0;

const elements = {
  fire: ["#ff4b20", "#ffb000"],
  water: ["#1b9cff", "#8eeeff"],
  nature: ["#30c85a", "#b8ff74"],
  electric: ["#ffe436", "#ffffff"],
  shadow: ["#342047", "#9d64ff"]
};

const map = [];
const dragons = [];
const particles = [];

for (let y = 0; y < MAP_H; y++) {
  const row = [];
  for (let x = 0; x < MAP_W; x++) {
    let type = "grass";

    if (x === 6 || y === 6) type = "path";
    if ((x < 3 && y > 9) || (x > 10 && y < 3)) type = "water";

    row.push({
      type,
      object: null,
      deco: Math.random()
    });
  }
  map.push(row);
}

const startObjects = [
  [2,2,"tree"], [3,2,"tree"], [10,9,"tree"],
  [8,3,"rock"], [1,11,"rock"], [12,4,"rock"],
  [4,6,"flower"], [7,7,"flower"], [11,10,"flower"],
  [5,4,"habitat"], [8,8,"habitat"]
];

for (const [x,y,type] of startObjects) {
  map[y][x].object = type;
}

function iso(x, y) {
  return {
    x: W / 2 + (x - y) * TILE_W / 2 + camX,
    y: 80 + (x + y) * TILE_H / 2 + camY
  };
}

function hud() {
  goldEl.textContent = Math.floor(gold);
  foodEl.textContent = Math.floor(food);
  gemEl.textContent = Math.floor(gem);
}

function drawDiamond(cx, cy, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + TILE_W / 2, cy + TILE_H / 2);
  ctx.lineTo(cx, cy + TILE_H);
  ctx.lineTo(cx - TILE_W / 2, cy + TILE_H / 2);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(0,0,0,.1)";
  ctx.stroke();
}

function drawTile(x, y, tile) {
  const p = iso(x, y);

  let color = "#67d957";
  if (tile.type === "path") color = "#d8c49a";
  if (tile.type === "water") color = "#41bfff";

  drawDiamond(p.x, p.y, color);

  if (tile.type === "grass" && tile.deco > .82) {
    ctx.fillStyle = "#2ca943";
    ctx.fillRect(p.x - 5, p.y + 13, 8, 8);
  }

  if (tile.type === "water") {
    ctx.fillStyle = "rgba(255,255,255,.55)";
    ctx.fillRect(p.x - 18, p.y + 15, 20, 3);
  }
}

function pxRect(x,y,w,h,c) {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
}

function drawTree(x, y) {
  const p = iso(x, y);
  pxRect(p.x - 6, p.y - 20, 12, 38, "#8a4e20");
  pxRect(p.x - 26, p.y - 48, 52, 24, "#2fad45");
  pxRect(p.x - 20, p.y - 64, 40, 24, "#43c95a");
}

function drawRock(x, y) {
  const p = iso(x, y);
  pxRect(p.x - 18, p.y - 10, 36, 20, "#8c98a3");
  pxRect(p.x - 10, p.y - 22, 24, 16, "#b9c2ca");
}

function drawFlower(x, y) {
  const p = iso(x, y);
  pxRect(p.x - 3, p.y - 8, 6, 14, "#2e9d41");
  pxRect(p.x - 10, p.y - 15, 8, 8, "#ff4b8a");
  pxRect(p.x + 3, p.y - 15, 8, 8, "#ffe45c");
}

function drawHabitat(x, y) {
  const p = iso(x, y);

  pxRect(p.x - 28, p.y - 18, 56, 34, "#8b5b2d");
  pxRect(p.x - 22, p.y - 34, 44, 18, "#ffd27a");
  pxRect(p.x - 14, p.y - 8, 28, 18, "#ffefbf");

  ctx.strokeStyle = "rgba(70,40,20,.55)";
  ctx.strokeRect(p.x - 28, p.y - 18, 56, 34);
}

function drawDragon(d) {
  const p = iso(d.x, d.y);
  const colors = elements[d.el];
  const flap = Math.sin(time * .15 + d.seed) * 5;
  const bob = Math.sin(time * .08 + d.seed) * 4;

  const x = p.x;
  const y = p.y - 30 + bob;

  pxRect(x - 24, y - 2 + flap, 16, 10, colors[1]);
  pxRect(x + 8, y - 2 - flap, 16, 10, colors[1]);

  pxRect(x - 14, y - 10, 28, 22, colors[0]);
  pxRect(x + 10, y - 20, 18, 14, colors[0]);

  pxRect(x + 23, y - 24, 5, 5, "#fff2a0");
  pxRect(x + 18, y - 25, 5, 5, "#fff2a0");

  pxRect(x + 22, y - 14, 4, 4, "#111");

  pxRect(x - 22, y + 4, 10, 8, colors[0]);
  pxRect(x - 30, y + 8, 8, 8, colors[0]);

  ctx.fillStyle = "rgba(0,0,0,.18)";
  ctx.beginPath();
  ctx.ellipse(x, y + 28, 25, 7, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawObject(x, y, type) {
  if (type === "tree") drawTree(x, y);
  if (type === "rock") drawRock(x, y);
  if (type === "flower") drawFlower(x, y);
  if (type === "habitat") drawHabitat(x, y);
}

function drawParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.y -= p.vy;
    p.life--;

    ctx.globalAlpha = p.life / 30;
    pxRect(p.x, p.y, 6, 6, p.color);
    ctx.globalAlpha = 1;

    if (p.life <= 0) particles.splice(i, 1);
  }
}

function spawnParticles(x,y,color) {
  for (let i = 0; i < 18; i++) {
    particles.push({
      x: x + Math.random() * 40 - 20,
      y: y + Math.random() * 30 - 15,
      vy: Math.random() * 1.5 + .4,
      life: 25 + Math.random() * 15,
      color
    });
  }
}

function drawSkyDecor() {
  ctx.fillStyle = "#ffe65c";
  ctx.fillRect(W - 120, 70, 54, 54);

  ctx.fillStyle = "rgba(255,255,255,.85)";
  ctx.fillRect(80, 90, 90, 18);
  ctx.fillRect(105, 72, 45, 22);
  ctx.fillRect(W - 280, 130, 80, 18);
}

function render() {
  ctx.clearRect(0,0,W,H);

  const bg = ctx.createLinearGradient(0,0,0,H);
  bg.addColorStop(0,"#75d8ff");
  bg.addColorStop(.55,"#d9fbff");
  bg.addColorStop(1,"#7de061");
  ctx.fillStyle = bg;
  ctx.fillRect(0,0,W,H);

  drawSkyDecor();

  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      drawTile(x,y,map[y][x]);
    }
  }

  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      if (map[y][x].object) drawObject(x,y,map[y][x].object);
    }
  }

  dragons.sort((a,b) => (a.x+a.y)-(b.x+b.y));
  for (const d of dragons) drawDragon(d);

  drawParticles();

  if (selected) {
    ctx.fillStyle = "rgba(255,255,255,.9)";
    ctx.font = "900 18px Arial";
    ctx.fillText("Seçili: " + selected + " | Tile tıkla", 20, H - 40);
  }
}

function screenToIso(mx, my) {
  const sx = mx - W / 2 - camX;
  const sy = my - 80 - camY;

  const x = Math.floor((sy / (TILE_H / 2) + sx / (TILE_W / 2)) / 2);
  const y = Math.floor((sy / (TILE_H / 2) - sx / (TILE_W / 2)) / 2);

  return {x,y};
}

function buyDragon(el, x, y) {
  const cost = el === "electric" ? 8 : el === "shadow" ? 10 : 5;
  if (gem < cost) return alert("Elmas yetmiyor.");
  if (map[y][x].object !== "habitat") return alert("Ejderha için habitat seç.");

  gem -= cost;

  dragons.push({
    x, y, el,
    seed: Math.random() * 1000
  });

  const p = iso(x,y);
  spawnParticles(p.x, p.y - 30, elements[el][0]);
  hud();
}

function placeHabitat(x, y) {
  if (gold < 150) return alert("Altın yetmiyor.");
  if (map[y][x].type === "water") return alert("Suya koyamazsın.");
  if (map[y][x].object) return alert("Bu tile dolu.");

  gold -= 150;
  map[y][x].object = "habitat";

  const p = iso(x,y);
  spawnParticles(p.x, p.y, "#ffd45c");
  hud();
}

canvas.addEventListener("click", e => {
  if (!selected) return;

  const {x,y} = screenToIso(e.clientX, e.clientY);

  if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return;

  if (selected === "habitat") placeHabitat(x,y);
  else buyDragon(selected,x,y);
});

marketBtn.onclick = () => market.classList.remove("hidden");
closeBtn.onclick = () => market.classList.add("hidden");

document.querySelectorAll("#market button[data-item]").forEach(btn => {
  btn.onclick = () => {
    selected = btn.dataset.item;
    market.classList.add("hidden");
  };
});

setInterval(() => {
  let habitats = 0;
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      if (map[y][x].object === "habitat") habitats++;
    }
  }

  gold += habitats * 2;
  food += dragons.length * .3;
  hud();
}, 2000);

function loop() {
  time++;
  render();
  requestAnimationFrame(loop);
}

hud();
loop();

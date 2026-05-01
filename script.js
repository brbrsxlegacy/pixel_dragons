const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const goldText = document.getElementById("goldText");
const foodText = document.getElementById("foodText");
const gemText = document.getElementById("gemText");

const marketBtn = document.getElementById("marketBtn");
const marketPanel = document.getElementById("marketPanel");
const closeMarket = document.getElementById("closeMarket");
const buyBtns = document.querySelectorAll(".buyBtn");

const TILE = 64;
const COLS = 12;
const ROWS = 8;

let gold = 500;
let food = 100;
let gems = 25;

let selectedBuy = null;
let time = 0;

const elements = {
  fire: {
    name: "Ateş",
    body: "#ff4a22",
    wing: "#ffb000",
    horn: "#fff0a0"
  },
  water: {
    name: "Su",
    body: "#249bff",
    wing: "#7ee6ff",
    horn: "#d9fbff"
  },
  nature: {
    name: "Doğa",
    body: "#34c759",
    wing: "#9dff72",
    horn: "#fff7b0"
  },
  electric: {
    name: "Elektrik",
    body: "#ffe03b",
    wing: "#fff8a8",
    horn: "#4c3bff"
  },
  shadow: {
    name: "Gölge",
    body: "#3b2a58",
    wing: "#8d5cff",
    horn: "#d8c7ff"
  }
};

const map = [];
const dragons = [];
const particles = [];

for (let y = 0; y < ROWS; y++) {
  const row = [];
  for (let x = 0; x < COLS; x++) {
    row.push({
      type: "grass",
      habitat: null,
      deco: Math.random()
    });
  }
  map.push(row);
}

function updateHud() {
  goldText.textContent = Math.floor(gold);
  foodText.textContent = Math.floor(food);
  gemText.textContent = Math.floor(gems);
}

function screenToTile(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const mx = (clientX - rect.left) * scaleX;
  const my = (clientY - rect.top) * scaleY;

  const ox = 96;
  const oy = 64;

  const x = Math.floor((mx - ox) / TILE);
  const y = Math.floor((my - oy) / TILE);

  return { x, y };
}

function drawPixelRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function drawTile(x, y, tile) {
  const px = 96 + x * TILE;
  const py = 64 + y * TILE;

  const base1 = "#69d84f";
  const base2 = "#5fc746";

  drawPixelRect(px, py, TILE, TILE, (x + y) % 2 === 0 ? base1 : base2);

  ctx.strokeStyle = "rgba(0,0,0,.08)";
  ctx.lineWidth = 2;
  ctx.strokeRect(px, py, TILE, TILE);

  if (tile.deco > .72) {
    drawPixelRect(px + 10, py + 12, 8, 8, "#3ebf3e");
    drawPixelRect(px + 42, py + 40, 10, 10, "#45b937");
  }

  if (tile.habitat) {
    drawHabitat(px, py, tile.habitat);
  }
}

function drawHabitat(px, py, type) {
  drawPixelRect(px + 8, py + 12, 48, 42, "#8b5a2b");
  drawPixelRect(px + 12, py + 8, 40, 12, "#d99038");
  drawPixelRect(px + 16, py + 24, 32, 26, "#ffe0a3");

  drawPixelRect(px + 20, py + 30, 10, 20, "#6e3b1b");
  drawPixelRect(px + 34, py + 30, 10, 20, "#6e3b1b");

  ctx.strokeStyle = "rgba(60,30,10,.5)";
  ctx.lineWidth = 3;
  ctx.strokeRect(px + 8, py + 12, 48, 42);

  drawPixelRect(px + 4, py + 50, 56, 8, "#3ba64a");
}

function drawDragon(dragon) {
  const el = elements[dragon.element];

  const flap = Math.sin(time * 0.18 + dragon.id) * 5;
  const bob = Math.sin(time * 0.08 + dragon.id) * 3;

  const x = dragon.x;
  const y = dragon.y + bob;

  drawPixelRect(x - 20, y - 4 + flap, 18, 12, el.wing);
  drawPixelRect(x + 2, y - 4 - flap, 18, 12, el.wing);

  drawPixelRect(x - 14, y - 10, 28, 24, el.body);
  drawPixelRect(x + 10, y - 18, 18, 16, el.body);

  drawPixelRect(x + 24, y - 22, 6, 6, el.horn);
  drawPixelRect(x + 18, y - 24, 6, 6, el.horn);

  drawPixelRect(x + 22, y - 12, 4, 4, "#111");
  drawPixelRect(x - 20, y + 2, 8, 8, el.body);
  drawPixelRect(x - 28, y + 6, 8, 8, el.body);

  drawPixelRect(x - 8, y + 14, 6, 10, "#333");
  drawPixelRect(x + 6, y + 14, 6, 10, "#333");

  ctx.fillStyle = "rgba(0,0,0,.18)";
  ctx.beginPath();
  ctx.ellipse(x, y + 25, 24, 8, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawCloud(x, y, s) {
  ctx.fillStyle = "rgba(255,255,255,.85)";
  ctx.fillRect(x, y, 60 * s, 18 * s);
  ctx.fillRect(x + 16 * s, y - 12 * s, 28 * s, 18 * s);
  ctx.fillRect(x + 42 * s, y - 6 * s, 28 * s, 18 * s);
}

function drawBackground() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, "#64cfff");
  sky.addColorStop(.55, "#bff5ff");
  sky.addColorStop(1, "#6fd95a");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawPixelRect(780, 40, 70, 70, "#fff05a");
  drawCloud(130, 48, 1);
  drawCloud(640, 88, .8);

  drawPixelRect(70, 38, 820, 560, "rgba(255,255,255,.18)");
  drawPixelRect(80, 48, 800, 540, "rgba(50,150,70,.18)");
}

function drawParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];

    p.y -= p.vy;
    p.life--;

    ctx.globalAlpha = p.life / 40;
    drawPixelRect(p.x, p.y, 6, 6, p.color);
    ctx.globalAlpha = 1;

    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

function drawSelectedGhost() {
  if (!selectedBuy) return;

  ctx.fillStyle = "rgba(255,255,255,.85)";
  ctx.font = "bold 18px Arial";
  ctx.fillText(
    selectedBuy === "habitat"
      ? "Habitat yerleştirmek için tile seç"
      : "Ejderha almak için habitat seç",
    96,
    36
  );
}

function render() {
  drawBackground();

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      drawTile(x, y, map[y][x]);
    }
  }

  for (const dragon of dragons) {
    drawDragon(dragon);
  }

  drawParticles();
  drawSelectedGhost();
}

function spawnParticles(x, y, color) {
  for (let i = 0; i < 16; i++) {
    particles.push({
      x: x + Math.random() * 40 - 20,
      y: y + Math.random() * 20,
      vy: Math.random() * 1.6 + .4,
      life: 30 + Math.random() * 20,
      color
    });
  }
}

function placeHabitat(tx, ty) {
  const tile = map[ty][tx];

  if (tile.habitat) return;
  if (gold < 150) return alert("Altın yetmiyor kanka.");

  gold -= 150;
  tile.habitat = "basic";

  spawnParticles(96 + tx * TILE + 32, 64 + ty * TILE + 32, "#ffd45a");
  updateHud();
}

function buyDragon(element, tx, ty) {
  const tile = map[ty][tx];

  if (!tile.habitat) return alert("Önce habitat koyman lazım.");
  if (gems < dragonCost(element)) return alert("Elmas yetmiyor kanka.");

  gems -= dragonCost(element);

  const px = 96 + tx * TILE + 32;
  const py = 64 + ty * TILE + 38;

  dragons.push({
    id: Date.now() + Math.random(),
    element,
    tileX: tx,
    tileY: ty,
    x: px,
    y: py,
    targetX: px,
    targetY: py
  });

  spawnParticles(px, py, elements[element].body);
  updateHud();
}

function dragonCost(element) {
  if (element === "electric") return 8;
  if (element === "shadow") return 10;
  return 5;
}

canvas.addEventListener("click", e => {
  const { x, y } = screenToTile(e.clientX, e.clientY);

  if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return;

  if (!selectedBuy) return;

  if (selectedBuy === "habitat") {
    placeHabitat(x, y);
  } else {
    buyDragon(selectedBuy, x, y);
  }
});

canvas.addEventListener("touchstart", e => {
  const t = e.touches[0];
  const { x, y } = screenToTile(t.clientX, t.clientY);

  if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return;

  if (!selectedBuy) return;

  if (selectedBuy === "habitat") {
    placeHabitat(x, y);
  } else {
    buyDragon(selectedBuy, x, y);
  }
});

marketBtn.onclick = () => {
  marketPanel.classList.remove("hidden");
};

closeMarket.onclick = () => {
  marketPanel.classList.add("hidden");
};

buyBtns.forEach(btn => {
  btn.onclick = () => {
    selectedBuy = btn.dataset.buy;
    marketPanel.classList.add("hidden");
  };
});

function passiveIncome() {
  let habitats = 0;

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (map[y][x].habitat) habitats++;
    }
  }

  gold += habitats * 1;
  food += dragons.length * 0.2;
  updateHud();
}

setInterval(passiveIncome, 2000);

function moveDragons() {
  for (const d of dragons) {
    if (Math.random() < 0.01) {
      d.targetX = 96 + d.tileX * TILE + 24 + Math.random() * 18;
      d.targetY = 64 + d.tileY * TILE + 30 + Math.random() * 18;
    }

    d.x += (d.targetX - d.x) * 0.02;
    d.y += (d.targetY - d.y) * 0.02;
  }
}

function loop() {
  time++;
  moveDragons();
  render();
  requestAnimationFrame(loop);
}

updateHud();
loop();

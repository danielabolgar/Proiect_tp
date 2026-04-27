import './style.css'
import { Grid } from './Grid'
import { Piece } from './Piece'

const app = document.querySelector<HTMLDivElement>('#app')!;

// --- STATE JOC ---
let scor = 0;
let nivel = 1;
let mutariEfectuate = 0;
let pieseDisponibile: Piece[] = [new Piece(), new Piece(), new Piece()];
let piesaSelectata: Piece | null = null;
let piesaInMana = false;
let jocTerminat = false;
let inMeniu = true;
let highScore = Number(localStorage.getItem('zenblocks_highscore')) || 0;

let offsetX = 0;
let offsetY = 0;

// --- INTERFAȚĂ HTML ---
app.innerHTML = `
  <div class="game-container">
    <div id="startScreen" class="overlay">
      <h1 class="glitch">ZenBlocks</h1>
      <p class="hs-text">HIGH SCORE: <span id="menuHighScore">${highScore}</span></p>
      <button id="startButton">INITIALIZE SYSTEM</button>
    </div>
    
    <div id="gameUI" style="display: none;">
      <h1 class="mini-title">ZenBlocks</h1>
      <div class="stats">
        NIVEL: <span id="levelDisplay">1</span> | 
        SCOR: <span id="scoreDisplay">0</span> | 
        SHIFT: <span id="shiftDisplay">5</span>
      </div>
    </div>

    <div class="canvas-wrapper">
      <canvas id="gameCanvas" width="400" height="580"></canvas>
    </div>
  </div>
`;

const canvas = document.querySelector<HTMLCanvasElement>('#gameCanvas')!;
const ctx = canvas.getContext('2d')!;
const grid = new Grid(40);

// --- LOGICĂ START & SALVARE ---
document.getElementById('startButton')?.addEventListener('click', () => {
    inMeniu = false;
    document.getElementById('startScreen')!.style.display = 'none';
    document.getElementById('gameUI')!.style.display = 'block';
});

function checkAndSaveHighScore() {
    if (scor > highScore) {
        highScore = scor;
        localStorage.setItem('zenblocks_highscore', highScore.toString());
        const hsDisplay = document.getElementById('menuHighScore');
        if (hsDisplay) hsDisplay.innerText = highScore.toString();
    }
}

function updateUI() {
    const scoreEl = document.getElementById('scoreDisplay');
    const levelEl = document.getElementById('levelDisplay');
    const shiftEl = document.getElementById('shiftDisplay');

    if (scoreEl) scoreEl.innerText = scor.toString();
    if (levelEl) levelEl.innerText = nivel.toString();
    const prag = Math.max(2, 6 - nivel);
    if (shiftEl) shiftEl.innerText = (prag - (mutariEfectuate % prag)).toString();
}

// --- SISTEM PARTICULE (EXPLOZIE) ---
interface Particle {
  x: number; y: number; vx: number; vy: number; life: number; color: string;
}
let particles: Particle[] = [];

function createExplosion(x: number, y: number, color: string) {
  for (let i = 0; i < 12; i++) {
    particles.push({
      x: x + 20, y: y + 20,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.5) * 12,
      life: 1.0, color: color
    });
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy;
    p.life -= 0.025;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function drawParticles(ctx: CanvasRenderingContext2D) {
  particles.forEach(p => {
    ctx.globalAlpha = p.life;
    ctx.shadowBlur = 15;
    ctx.shadowColor = p.color;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, 3, 3);
  });
  ctx.globalAlpha = 1.0;
  ctx.shadowBlur = 0;
}

// --- EVENIMENTE INTERACȚIUNE ---
canvas.addEventListener('pointerdown', (e: PointerEvent) => {
  if (inMeniu) return; // Blocăm dacă ești în meniu
  if (jocTerminat) {
    location.reload();
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  pieseDisponibile.forEach((piece) => {
    if (mouseX >= piece.x && mouseX <= piece.x + 100 && 
        mouseY >= piece.y && mouseY <= piece.y + 120) {
      piesaSelectata = piece;
      piesaInMana = true;
      offsetX = mouseX - piece.x;
      offsetY = mouseY - piece.y;
    }
  });
});

window.addEventListener('pointermove', (e: PointerEvent) => {
  if (!piesaInMana || !piesaSelectata || jocTerminat || inMeniu) return;
  const rect = canvas.getBoundingClientRect();
  piesaSelectata.x = e.clientX - rect.left - offsetX;
  piesaSelectata.y = e.clientY - rect.top - offsetY;
});

window.addEventListener('pointerup', () => {
  if (!piesaInMana || !piesaSelectata) return;

  const gridX = Math.round(piesaSelectata.x / grid.cellSize);
  const gridY = Math.round(piesaSelectata.y / grid.cellSize);

  if (grid.verifica_validitate(piesaSelectata.shape, gridX, gridY)) {
    grid.plaseaza_piesa(piesaSelectata.shape, gridX, gridY);
    
    const index = pieseDisponibile.indexOf(piesaSelectata);
    if (index !== -1) {
      pieseDisponibile[index] = new Piece(); 
    }
    
    scor += 10;
    handleMoveLogic(); 
  }

  piesaSelectata = null;
  piesaInMana = false;
});

function handleMoveLogic() {
    mutariEfectuate++;
    const result = grid.clearLines();
    
    if (result.destroyedCells && result.destroyedCells.length > 0) {
      result.destroyedCells.forEach(cell => createExplosion(cell.x, cell.y, cell.color));
    }

    scor += result.points;
    scor += grid.checkGeometryBonus();

    if (scor >= nivel * 1000) nivel++;
    const pragGravity = Math.max(2, 6 - nivel); 
    if (mutariEfectuate % pragGravity === 0) grid.applyGravity();
    
    if (!grid.poate_plasa_orice(pieseDisponibile)) {
        jocTerminat = true;
        checkAndSaveHighScore();
    }
    updateUI();
}

// --- RENDER LOOP ---
function gameLoop() {
  ctx.fillStyle = '#020204';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Update particule (le lăsăm să zboare și în meniu pentru atmosferă)
  updateParticles();
  drawParticles(ctx);

  if (!inMeniu) {
    grid.draw(ctx);

    const timp = Date.now() * 0.003;
    pieseDisponibile.forEach((piece, index) => {
      if (piece !== piesaSelectata) {
        piece.x = 45 + index * 125;
        piece.y = 460 + Math.sin(timp + index) * 5; 
      } else {
        ctx.shadowBlur = 25;
        ctx.shadowColor = piece.isTitan ? "#ff00ff" : "#00ffff";
      }
      piece.draw(ctx, 30, piece.x, piece.y); 
      ctx.shadowBlur = 0;
    });
  }

  if (jocTerminat) {
    const overlayGrad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width);
    overlayGrad.addColorStop(0, 'rgba(10, 11, 20, 0.9)');
    overlayGrad.addColorStop(1, 'rgba(5, 5, 9, 1)');
    ctx.fillStyle = overlayGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.shadowBlur = 20; ctx.shadowColor = "#ff00ff";
    ctx.textAlign = 'center'; ctx.fillStyle = '#ff00ff';
    ctx.font = 'bold 35px Orbitron, sans-serif';
    ctx.fillText("SYSTEM FAILURE", canvas.width / 2, canvas.height / 2 - 30);

    ctx.shadowColor = "#00ffff"; ctx.fillStyle = '#00ffff';
    ctx.font = '22px Orbitron, sans-serif';
    ctx.fillText("SCOR: " + scor, canvas.width / 2, canvas.height / 2 + 25);

    ctx.shadowBlur = 0; ctx.fillStyle = '#e0e6ed';
    ctx.font = '14px Orbitron, sans-serif';
    ctx.fillText("TAP TO REBOOT SYSTEM", canvas.width / 2, canvas.height / 2 + 75);
  }

  requestAnimationFrame(gameLoop);
}

gameLoop();
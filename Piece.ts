import { COLORS } from './constants'

export class Piece {
  shape: number[][];
  color: string;
  isTitan: boolean;
  x: number = 0; 
  y: number = 0;

  constructor() {
    this.shape = this.generateRandomShape();
    
    // 20% șansă să conțină un element Titan
    this.isTitan = Math.random() < 0.2; 
    if (this.isTitan) {
      this.injectTitan();
    }

    // Culori neon din constante sau albastru metalic pentru Titan
    this.color = this.isTitan ? '#457B9D' : COLORS[Math.floor(Math.random() * COLORS.length)];
  }

  private generateRandomShape(): number[][] {
    const models = [
      // --- CLASICE (7) ---
      [[1, 1], [1, 1]],             // Pătrat 2x2
      [[1, 1, 1, 1]],               // Linie Orizontală 4
      [[1], [1], [1], [1]],         // Linie Verticală 4
      [[1, 1, 0], [0, 1, 1]],       // Z Shape
      [[0, 1, 1], [1, 1, 0]],       // S Shape
      [[1, 1, 1], [0, 1, 0]],       // T Shape
      [[1, 0, 0], [1, 1, 1]],       // L Shape
      
      // --- MINIMALISTE (5) ---
      [[1]],                        // Punct (1x1)
      [[1, 1]],                     // Linie 2
      [[1], [1]],                  // Linie verticală 2
      [[1, 1], [1, 0]],             // Mini L
      [[1, 1, 1]],                  // Linie 3

      // --- COMPLEXE / GIGANT (9) ---
      [[1, 1, 1], [1, 1, 1], [1, 1, 1]], // Pătrat Gigant 3x3
      [[0, 1, 0], [1, 1, 1], [0, 1, 0]], // Cruce / Plus
      [[1, 0, 1], [1, 1, 1]],            // U-shape
      [[1, 1, 1, 1, 1]],                 // Linie Orizontală 5
      [[1], [1], [1], [1], [1]],         // Linie Verticală 5
      [[1, 1, 1], [1, 0, 0], [1, 0, 0]], // L Mare 3x3
      [[1, 1, 1], [0, 0, 1], [0, 0, 1]], // J Mare 3x3
      [[1, 1, 0], [0, 1, 0], [0, 1, 1]], // Scară / Zig-zag
      [[1, 1, 1], [1, 0, 1]]             // Poartă / Pod
    ];
    return models[Math.floor(Math.random() * models.length)];
  }

  private injectTitan() {
    for (let r = 0; r < this.shape.length; r++) {
      for (let c = 0; c < this.shape[r].length; c++) {
        if (this.shape[r][c] === 1) {
          this.shape[r][c] = -1; // Primul bloc găsit devine Titan
          return;
        }
      }
    }
  }

  // Funcție ajutătoare pentru designul de cristal/neon
  private drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  draw(ctx: CanvasRenderingContext2D, cellSize: number, offsetX: number, offsetY: number) {
    if (!this.shape || this.shape.length === 0) return;

    this.x = offsetX;
    this.y = offsetY;

    for (let r = 0; r < this.shape.length; r++) {
      for (let c = 0; c < this.shape[r].length; c++) {
        if (this.shape[r][c] !== 0) {
          const blockX = offsetX + c * cellSize;
          const blockY = offsetY + r * cellSize;
          const isBlockTitan = this.shape[r][c] === -1;

          // --- STIL NEON / CRYSTAL ---
          ctx.shadowBlur = isBlockTitan ? 15 : 10;
          ctx.shadowColor = isBlockTitan ? "#ff00ff" : this.color;

          // Gradient pentru fiecare bloc
          const grad = ctx.createLinearGradient(blockX, blockY, blockX + cellSize, blockY + cellSize);
          if (isBlockTitan) {
            grad.addColorStop(0, "#4a00e0");
            grad.addColorStop(1, "#ff00ff");
          } else {
            grad.addColorStop(0, this.color);
            grad.addColorStop(1, "#ffffff"); // Reflexie de lumină
          }

          ctx.fillStyle = grad;
          this.drawRoundedRect(ctx, blockX + 2, blockY + 2, cellSize - 4, cellSize - 4, 6);
          ctx.fill();

          ctx.shadowBlur = 0;

          // Efect de nucleu pentru Titan
          if (isBlockTitan) {
             ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
             ctx.lineWidth = 2;
             ctx.beginPath();
             ctx.arc(blockX + cellSize/2, blockY + cellSize/2, 5, 0, Math.PI * 2);
             ctx.stroke();
          }
          
          // Reflexie de sticlă (diagonală)
          ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
          ctx.beginPath();
          ctx.moveTo(blockX + 6, blockY + 6);
          ctx.lineTo(blockX + cellSize - 12, blockY + 6);
          ctx.lineTo(blockX + 6, blockY + cellSize - 12);
          ctx.fill();
        }
      }
    }
  }
}
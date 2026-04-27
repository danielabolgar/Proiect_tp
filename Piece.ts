import { COLORS } from './constants'

export class Piece {
  shape: number[][];
  color: string;
  isTitan: boolean;
  x: number = 0; 
  y: number = 0;

  constructor() {
    this.shape = this.generateRandomShape();
    
   
    this.isTitan = Math.random() < 0.2; 
    if (this.isTitan) {
      this.injectTitan();
    }

    
    this.color = this.isTitan ? '#457B9D' : COLORS[Math.floor(Math.random() * COLORS.length)];
  }

  private generateRandomShape(): number[][] {
    const models = [
      
      [[1, 1], [1, 1]],             
      [[1, 1, 1, 1]],              
      [[1], [1], [1], [1]],         
      [[1, 1, 0], [0, 1, 1]],      
      [[0, 1, 1], [1, 1, 0]],       
      [[1, 1, 1], [0, 1, 0]],       
      [[1, 0, 0], [1, 1, 1]],      
      
     
      [[1]],                        
      [[1, 1]],                   
      [[1], [1]],                 
      [[1, 1], [1, 0]],           
      [[1, 1, 1]],                  

      
      [[1, 1, 1], [1, 1, 1], [1, 1, 1]], 
      [[0, 1, 0], [1, 1, 1], [0, 1, 0]], 
      [[1, 0, 1], [1, 1, 1]],           
      [[1, 1, 1, 1, 1]],                
      [[1], [1], [1], [1], [1]],         
      [[1, 1, 1], [1, 0, 0], [1, 0, 0]],
      [[1, 1, 1], [0, 0, 1], [0, 0, 1]], 
      [[1, 1, 0], [0, 1, 0], [0, 1, 1]], 
      [[1, 1, 1], [1, 0, 1]]             
    ];
    return models[Math.floor(Math.random() * models.length)];
  }

  private injectTitan() {
    for (let r = 0; r < this.shape.length; r++) {
      for (let c = 0; c < this.shape[r].length; c++) {
        if (this.shape[r][c] === 1) {
          this.shape[r][c] = -1; 
          return;
        }
      }
    }
  }

 
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

         
          ctx.shadowBlur = isBlockTitan ? 15 : 10;
          ctx.shadowColor = isBlockTitan ? "#ff00ff" : this.color;

         
          const grad = ctx.createLinearGradient(blockX, blockY, blockX + cellSize, blockY + cellSize);
          if (isBlockTitan) {
            grad.addColorStop(0, "#4a00e0");
            grad.addColorStop(1, "#ff00ff");
          } else {
            grad.addColorStop(0, this.color);
            grad.addColorStop(1, "#ffffff"); 
          }

          ctx.fillStyle = grad;
          this.drawRoundedRect(ctx, blockX + 2, blockY + 2, cellSize - 4, cellSize - 4, 6);
          ctx.fill();

          ctx.shadowBlur = 0;

         
          if (isBlockTitan) {
             ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
             ctx.lineWidth = 2;
             ctx.beginPath();
             ctx.arc(blockX + cellSize/2, blockY + cellSize/2, 5, 0, Math.PI * 2);
             ctx.stroke();
          }
          
         
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

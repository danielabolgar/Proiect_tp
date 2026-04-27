export class Block {
  shape: number[][];
  color: string;
  x: number;
  y: number;

  constructor(shape: number[][], color: string) {
    this.shape = shape; 
    this.color = color;
    this.x = 0;
    this.y = 0;
  }

  draw(ctx: CanvasRenderingContext2D, cellSize: number) {
    ctx.fillStyle = this.color;
    for (let row = 0; row < this.shape.length; row++) {
      for (let col = 0; col < this.shape[row].length; col++) {
        if (this.shape[row][col] === 1) {
          ctx.fillRect(
            (this.x + col) * cellSize,
            (this.y + row) * cellSize,
            cellSize - 2,
            cellSize - 2
          );
        }
      }
    }
  }
}

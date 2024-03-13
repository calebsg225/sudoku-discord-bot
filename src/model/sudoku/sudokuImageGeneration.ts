import Canvas from "@napi-rs/canvas";
import { Theme } from "./types/sudokuTypes";
import sudokuThemesImport from "../../data/sudokuThemes.json";
import { resourceLimits } from "worker_threads";

// is there a better way to do this??
const sudokuThemes: {[theme: string]: Theme} = sudokuThemesImport;

class SudokuIamgeHandler {
  font: string;
  width: number;
  borderThickness: number;
  widthWithBorder: number;
  lineThickness: number;
  context: "2d";
  base: Canvas.Canvas;
  border: Canvas.Canvas;
  board: Canvas.Canvas;

  constructor() {
    this.font = 'Roboto Mono';
    this.width = 600;
    this.borderThickness = 12;
    this.widthWithBorder = this.width + this.borderThickness*2;
    this.lineThickness = 6;
    this.context = "2d";
    
  }

  // create empty sudoku board
  createBase = (theme: string) => {
    this.base = Canvas.createCanvas(this.width, this.width);
    const ctx = this.base.getContext(this.context);

    // fill in background
    ctx.fillStyle = sudokuThemes[theme].background;
    ctx.fillRect(0, 0, this.width, this.width);

    // set base color
    ctx.strokeStyle = sudokuThemes[theme].base;
    
    // thin lines
    ctx.lineWidth = this.lineThickness / 3;
    for (let i = 0; i < this.width; i+=(this.width/9)) {
      ctx.beginPath();

      ctx.moveTo(0, i);
      ctx.lineTo(this.width, i);
      ctx.moveTo(i, 0);
      ctx.lineTo(i, this.width);

      ctx.closePath();
      ctx.stroke();
    }

    // thick lines
    ctx.lineWidth = this.lineThickness;
    for (let i = 0; i <= this.width; i+=(this.width/3)) {
      ctx.beginPath();

      ctx.moveTo(0, i);
      ctx.lineTo(this.width, i);
      ctx.moveTo(i, 0);
      ctx.lineTo(i, this.width);

      ctx.closePath();
      ctx.stroke();
    }

    this.createBorder(theme);
  }

  // border for sudoku base
  private createBorder = (theme: string) => {
    this.border = Canvas.createCanvas(this.widthWithBorder, this.widthWithBorder);
    const ctx = this.border.getContext(this.context);

    ctx.fillStyle = sudokuThemes[theme].base;
    ctx.fillRect(0, 0, this.widthWithBorder, this.widthWithBorder);
  }

  createBoard = (theme: string): Canvas.Canvas => {
    const result = Canvas.createCanvas(this.widthWithBorder, this.widthWithBorder);
    const ctx = result.getContext(this.context);

    ctx.drawImage(this.border, 0, 0);
    ctx.drawImage(this.board, this.borderThickness, this.borderThickness);

    return result;
  }

  // fill empty board with new puzzle data
  populateBoard = (theme: string, puzzle: string, pencilMarkings: string): void => {
    this.board = this.base;
  }

  updateCanvas = () => {}

  // update theme when theme command is used
  changeTheme = (theme: string): void => {
    this.createBase(theme);
  }
}

export default SudokuIamgeHandler;
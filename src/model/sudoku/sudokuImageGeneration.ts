import Canvas from "@napi-rs/canvas";
import sudokuThemes from "../../data/sudokuThemes.json";
import { AttachmentBuilder, EmbedBuilder, InteractionReplyOptions } from "discord.js";

import { Theme, PuzzleData } from "./types/sudokuTypes";

class SudokuIamgeHandler {
  font: string;

  width: number;
  borderThickness: number;
  lineThickness: number;

  base: Canvas.Canvas;
  board: Canvas.Canvas;

  constructor() {
    this.font = 'Roboto Mono';

    this.width = 600;
    this.borderThickness = 12;
    this.lineThickness = 6;
  }

  createBase = (theme: string) => {
    this.base = Canvas.createCanvas(this.width, this.width);
    const ctx = this.base.getContext('2d');

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
  }

  createBoard = (theme: string): Canvas.Canvas => {
    return this.base;
  }

  // fill empty board with new puzzle data
  populateCanvas = (puzzle: string, pencilMarkings: string): Canvas.Canvas => {
    this.board = this.base;
    return 
  }

  updateCanvas = () => {}

  // update theme when theme command is used
  changeTheme = (theme: string): void => {
    this.createBase(theme);
  }
}

export default SudokuIamgeHandler;
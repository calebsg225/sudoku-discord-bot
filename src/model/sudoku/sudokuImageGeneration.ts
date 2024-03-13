import Canvas from "@napi-rs/canvas";
import sudokuThemes from "../../data/sudokuThemes.json";
import { AttachmentBuilder, EmbedBuilder } from "discord.js";

type Theme = {
  background: string,
  base: string,
  inputDigit: string,
  highlightDigit: string,
  solvedDigit: string
}

class SudokuIamgeHandler {
  font: string;
  theme: Theme;

  width: number;
  borderThickness: number;
  lineThickness: number;

  base: Canvas.Canvas;
  board: Canvas.Canvas;

  constructor() {
    this.font = 'Roboto Mono';
    this.theme = sudokuThemes['default'];

    this.width = 600;
    this.borderThickness = 12;
    this.lineThickness = 8;

    this.createCanvasBase();
  }

  private createCanvasBase = () => {
    this.board = Canvas.createCanvas(this.width, this.width);
    const ctx = this.board.getContext('2d');

    // fill in background
    ctx.fillStyle = this.theme.background;
    ctx.fillRect(0, 0, this.width, this.width);

    // set base color
    ctx.strokeStyle = this.theme.base;
    ctx.lineWidth = this.lineThickness / 3;

    // thick lines
    for (let i = 0; i < this.width; i+=(this.width/9)) {
      ctx.beginPath();

      ctx.moveTo(0, i);
      ctx.lineTo(this.width, i);
      ctx.moveTo(i, 0);
      ctx.lineTo(i, this.width);

      ctx.closePath();
      ctx.stroke();
    }
  }

  populateCanvas = () => {}

  gernerateSudokuEmbed = async (displayName: string, difficulty: string) => {
    const attachment = new AttachmentBuilder(await this.board.encode('png'), { name: "sudoku.png" });
    const sudokuEmbed = new EmbedBuilder()
      .setTitle(`@${displayName}'s Sudoku, Difficulty: \`${difficulty}\``)
      .setImage('attachment://sudoku.png')
      .setColor('DarkButNotBlack');
    const reply = {
      embeds: [sudokuEmbed],
      files: [attachment]
    }
    return reply;
  }

  changeTheme = (theme: string) => {
    this.theme = sudokuThemes[theme];
    this.createCanvasBase();
  }
}

export default SudokuIamgeHandler;
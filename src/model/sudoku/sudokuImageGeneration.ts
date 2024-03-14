import Canvas from "@napi-rs/canvas";
import { PuzzleData, Theme } from "./types/sudokuTypes";
import sudokuThemesImport from "../../data/sudokuThemes.json";

// sets a type to imported json file
// is there a better way to do this??
const sudokuThemes: {[theme: string]: Theme} = sudokuThemesImport;

class SudokuIamgeHandler {
  font: string;
  width: number;
  borderThickness: number;
  widthWithBorder: number;
  lineThickness: number;
  context: any; // only setting to any to prevent duplicate values
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
  private createBase = (theme: string) => {
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

  // combine all canvases into one
  // returns complete sudoku board
  createBoard = (theme: string): Canvas.Canvas => {
    const result = Canvas.createCanvas(this.widthWithBorder, this.widthWithBorder);
    const ctx = result.getContext(this.context);

    ctx.drawImage(this.border, 0, 0);
    ctx.drawImage(this.base, this.borderThickness, this.borderThickness);
    ctx.drawImage(this.board, this.borderThickness, this.borderThickness);

    return result;
  }

  // fill empty board with new puzzle data
  private populateBoard = (theme: string, puzzleData: PuzzleData): void => {
    const { currentPuzzle: curPuz, defaultPuzzle: defPuz, pencilMarkings: marks } = puzzleData;

    this.board = Canvas.createCanvas(this.width, this.width);
    const ctx = this.board.getContext(this.context);

    const interval = this.width/18;
    const digitPadding = interval/6;
    const pixelWidth = this.width/9 - digitPadding*2;

    // set font
    ctx.font = `${pixelWidth}px ${this.font}`;
    // center digit in each square
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // fill in main digits
    let digitPointer = 0;
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (+curPuz[digitPointer]) {
          // set digit color differently for default digits and user inputed digits
          ctx.fillStyle = +defPuz[digitPointer] ? sudokuThemes[theme].base : sudokuThemes[theme].inputedDigit;
          ctx.fillText(curPuz[digitPointer], (j*interval*2) + interval, (i*interval*2) + interval );
        } else {
          // fill in pencil markings if any
          this.populatePencilMarkingsInSquare(i*interval*2, j*interval*2, marks.substring(digitPointer*9, digitPointer*9+9), ctx);
        }
        digitPointer++;
      }
    }
  }

  // generate all pencil markings for one square
  private populatePencilMarkingsInSquare = (
    row: number,
    column: number,
    pencilMarkings: string,
    ctx: Canvas.SKRSContext2D
  ) => {

  }
  
  addPencilMarking = (
    theme: string,
    digit: number,
    row: number,
    col: number
  ): void => {
    const ctx = this.board.getContext(this.context);
    const interval = this.width/9
    
    const pencilCol = digit%3;
    const pencilRow = (digit - pencilCol)/3;
    
    const pencilInterval = interval/6;
    // _Intervel = (_interval) + (_pencilInterval)
    const xInterval = (interval * col) + ((pencilCol * pencilInterval * 2) + pencilInterval);
    const yInterval = (interval * row) + ((pencilRow * pencilInterval * 2) + pencilInterval);

    const pixelWidth = pencilInterval*2; // change pencil mark font size here

    ctx.fillStyle = sudokuThemes[theme].inputedDigit;
    ctx.font = `${pixelWidth}px ${this.font}`;
    ctx.fillText(`${digit+1}`, xInterval, yInterval);
  }

  removePencilMarking = (theme: string, digit: number, row: number, col: number): void => {}

  // remove digit or pencil markings from a square on the sudoku board
  clearSquare = (row: number, col: number): void => {
    const ctx = this.board.getContext(this.context);
    const interval = this.width/9;

    ctx.clearRect(
      (col * interval) + this.lineThickness,
      (row * interval) + this.lineThickness,
      interval - (this.lineThickness * 2),
      interval - (this.lineThickness * 2)
    );
  }

  // regenerates only the data of sudoku puzzle
  // used when a new sudoku is created
  // or when saved or completed games are loaded
  regenerateData = (theme: string, puzzleData: PuzzleData): void => {
    this.populateBoard(theme, puzzleData);
  }

  // regenerate new base, border, and board canvases
  // used on session initialization and theme change
  regenerateAll = (theme: string, puzzleData: PuzzleData): void => {
    this.createBase(theme);
    this.populateBoard(theme, puzzleData);
  }
}

export default SudokuIamgeHandler;
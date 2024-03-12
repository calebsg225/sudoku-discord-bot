import SudokuIamgeHandler from "./sudokuImageGeneration";
import SudokuSolver from "./sudokuSolver";
import SudokuDatabaseHandler from "./sudokuDatabase";

import { Message } from "discord.js";

import Canvas from "@napi-rs/canvas";
import fs from "node:fs";

// path to txt files containing all sudoku puzzles
const sudokuPuzzlePath = "./src/data/sudokuPuzzles/";

class SudokuHandler {
  imageHandler: SudokuIamgeHandler;
  solver: SudokuSolver;
  database: SudokuDatabaseHandler;
  
  message: Message; // discord message of previous sudoku image

  board: Canvas.Canvas;

  puzzleData: {
    difficulty: string,
    defaultPuzzle: string,
    currentPuzzle: string,
    pencilMarkings: string
  }

  constructor(difficulty: string, userId: string) {
    this.imageHandler = new SudokuIamgeHandler; // class to handle sudoku image
    this.solver = new SudokuSolver; // class to handle puzzle checking and solving
    this.database = new SudokuDatabaseHandler(userId);

    this.puzzleData = {
      difficulty: difficulty,
      defaultPuzzle: ``,
      currentPuzzle: ``,
      pencilMarkings: "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
    }

    this.message;

    this.board = this.imageHandler.createCanvasBase();
  }

  // sets new sudoku puzzle
  getRandomLine = () => {
    const lines = fs.readFileSync(`${sudokuPuzzlePath}${this.puzzleData.difficulty.toLowerCase()}.txt`).toString().split(`\n`);
    const randomLine = lines[Math.floor(Math.random() * lines.length)];
    this.puzzleData.defaultPuzzle = randomLine.substring(13, 94);
  }

  placeDigit = (row: number, column: number, digit: number) => {}

  removeDigit = (row: number, column: number) => {}

  highlightDigit = (digit: number) => {}

  private getDigitIndicies = (digitL: number) => {}

  pencil = (row: number, column: number, digit: number) => {}

  resetPuzzle = () => {}

  solveSudoku = () => {}

  changeDifficulty = (difficulty: string) => {}

  changeTheme = (theme: string) => {
    this.database.changeTheme(theme);
    this.imageHandler.changeTheme(theme);
  }
  
}

export default SudokuHandler;
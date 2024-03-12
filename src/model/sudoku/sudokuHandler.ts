import SudokuIamgeHandler from "./sudokuImageGeneration";
import SudokuSolver from "./sudokuSolver";

import { Message } from "discord.js";

import Canvas from "@napi-rs/canvas";
import fs from "node:fs";

// path to txt files containing all sudoku puzzles
const sudokuPuzzlePath = "./src/data/sudokuPuzzles/";

type Difficulty = "Easy" | "Medium" | "Hard" | "Diabolical";

class SudokuHandler {
  imageHandler: SudokuIamgeHandler;
  solver: SudokuSolver;
  
  message: Message // discord message of previous sudoku image

  board: Canvas.Canvas;

  puzzleData: {
    difficulty: Difficulty,
    defaultPuzzle: string,
    currentPuzzle: string
  }

  constructor(difficulty: Difficulty) {
    this.imageHandler = new SudokuIamgeHandler; // class to handle sudoku image
    this.solver = new SudokuSolver; // class to handle puzzle checking and solving

    this.puzzleData = {
      difficulty: difficulty,
      defaultPuzzle: ``,
      currentPuzzle: ``
    }

    this.message;
  }

  // sets new sudoku puzzle
  getRandomLine = () => {
    const lines = fs.readFileSync(`${sudokuPuzzlePath}${this.puzzleData.difficulty.toLowerCase()}.txt`).toString().split(`\n`);
    const randomLine = lines[Math.floor(Math.random() * lines.length)];
    this.puzzleData.currentPuzzle = randomLine.substring(13, 94);
  }
  
}

export default SudokuHandler;
import SudokuIamgeHandler from "./sudokuImageGeneration";
import SudokuSolver from "./sudokuSolver";

import Canvas from "@napi-rs/canvas";

class SudokuSession {
  imageHandler: SudokuIamgeHandler;
  solver: SudokuSolver;

  board: Canvas.Canvas;

  constructor() {
    this.imageHandler = new SudokuIamgeHandler; // class to handle sudoku image
    this.solver = new SudokuSolver; // class to handle puzzle checking and solving

  }
  
}

export default SudokuSession;
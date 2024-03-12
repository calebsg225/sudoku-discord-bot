import Canvas from "@napi-rs/canvas";
import sudokuThemes from "../../data/sudokuThemes.json";

class SudokuIamgeHandler {
  font: string;
  theme: string;

  width: number;
  borderThickness: number;

  base: Canvas.Canvas;
  board: Canvas.Canvas;

  constructor() {
    this.font = 'Roboto Mono';
    this.theme = 'default';
  }

  createCanvasBase = (): Canvas.Canvas => {
    return
  }

  populateCanvas = () => {}

  changeTheme = (theme: string) => {
    this.theme = theme;
  }
}

export default SudokuIamgeHandler;
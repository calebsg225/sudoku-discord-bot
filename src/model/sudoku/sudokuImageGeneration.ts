import Canvas from "@napi-rs/canvas";
import sudokuThemes from "../../data/sudokuThemes.json";

class SudokuIamgeHandler {
  font: string;

  theme: string;

  constructor(theme: string) {
    this.font = 'Roboto Mono';
    this.theme = theme;
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
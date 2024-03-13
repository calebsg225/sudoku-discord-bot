import Canvas from "@napi-rs/canvas";
import sudokuThemes from "../../data/sudokuThemes.json";
import { AttachmentBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

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

  gernerateSudokuEmbed = async (displayName: string, difficulty: string) => {
    const attachment = new AttachmentBuilder(await this.board.encode("png"), { name: "sudoku.png" });
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
    this.theme = theme;
  }
}

export default SudokuIamgeHandler;
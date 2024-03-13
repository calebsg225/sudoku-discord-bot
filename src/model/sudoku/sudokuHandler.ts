import SudokuIamgeHandler from "./sudokuImageGeneration";
import SudokuSolver from "./sudokuSolver";
import SudokuDatabaseHandler from "./sudokuDatabase";
import { PuzzleData } from "./types/sudokuTypes";
import { AttachmentBuilder, EmbedBuilder, InteractionReplyOptions, Message, User } from "discord.js";
import Canvas from "@napi-rs/canvas";
import fs from "node:fs";

// path to txt files containing all sudoku puzzles
const sudokuPuzzlePath = "./src/data/sudokuPuzzles/";

class SudokuHandler {
  private imageHandler: SudokuIamgeHandler;
  private solver: SudokuSolver;
  private database: SudokuDatabaseHandler;
  
  message: Message; // discord message of previous sudoku image
  user: User; // user the session belongs to

  regenerate: boolean; // set to true if theme changes or a new game is created

  private puzzleData: PuzzleData;

  constructor(user: User , difficulty: string, message: Message) {
    this.solver = new SudokuSolver; // class to handle puzzle checking and solving
    this.database = new SudokuDatabaseHandler(user.id);
    this.imageHandler = new SudokuIamgeHandler(); // class to handle sudoku image
    
    this.generateNewPuzzle(difficulty);
    
    this.message = message;
    this.user = user;

    this.regenerate = true;
  }

  // run async functions when first creating a new session
  init = async (): Promise<InteractionReplyOptions> => {
    return await this.generateSudokuEmbed();
  }

  private getNewLine = (difficulty: string) => {
    const lines = fs.readFileSync(`${sudokuPuzzlePath}${difficulty.toLowerCase()}.txt`).toString().split(`\n`);
    const randomLine = lines[Math.floor(Math.random() * lines.length)];
    return randomLine.substring(13, 94);
  }

  // sets new sudoku puzzle
  generateNewPuzzle = (difficulty: string) => {
    this.regenerate = true;
    const puzzle = this.getNewLine(difficulty);
    this.puzzleData = {
      difficulty: difficulty,
      defaultPuzzle: puzzle,
      currentPuzzle: puzzle,
      pencilMarkings: "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
    }
  }

  // creates updated embed containing the sudoku game
  private generateSudokuEmbed = async (): Promise<InteractionReplyOptions> => {
    const theme = await this.database.getTheme();

    // regenerate sudoku game if theme changes or a new game is made
    if (this.regenerate) {
      this.imageHandler.regenerate(theme, this.puzzleData);
      this.regenerate = false;
    }
    const board = this.imageHandler.createBoard(theme);
    const attachment = new AttachmentBuilder(await board.encode('png'), { name: "sudoku.png" });
    const sudokuEmbed = new EmbedBuilder()
      .setTitle(`@${this.user.displayName}'s Sudoku, Difficulty: \`${this.puzzleData.difficulty}\``)
      .setImage('attachment://sudoku.png')
      .setColor('DarkButNotBlack');
    const reply = {
      embeds: [sudokuEmbed],
      files: [attachment]
    }
    return reply;
  }

  private populateSudoku = async () => {}

  placeDigit = (row: number, column: number, digit: number) => {}

  removeDigit = (row: number, column: number) => {}

  highlightDigit = (digit: number) => {}

  private getDigitIndicies = (digit: number) => {}

  pencil = (row: number, column: number, digit: number) => {}

  resetPuzzle = () => {}

  solveSudoku = () => {}

  generateReply = async (message: Message) => {
    this.message = message;
    return await this.generateSudokuEmbed();
  }

  changeDifficulty = (difficulty: string) => {}

  // updates database and session with new theme
  changeTheme = async (theme: string): Promise<InteractionReplyOptions> => {
    this.regenerate = true;
    await this.database.changeTheme(theme);
    return await this.generateSudokuEmbed();
  }
  
}

export default SudokuHandler;
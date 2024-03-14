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

  private puzzleData: PuzzleData;

  constructor(user: User) {
    this.user = user;
    this.solver = new SudokuSolver; // class to handle puzzle checking and solving
    this.database = new SudokuDatabaseHandler(this.user.id);
    this.imageHandler = new SudokuIamgeHandler(); // class to handle sudoku image
  }

  // [sudoku] discord command
  // handles initial puzzle creation and embed generation
  init = async (difficulty: string, message: Message): Promise<InteractionReplyOptions> => {
    const theme = await this.database.getTheme();

    this.message = message;
    this.setNewPuzzleData(difficulty);

    const board = this.imageHandler.regenerateAll(theme, this.puzzleData);
    return await this.generateEmbed(board);
  }

  // first half of [new] discord command
  // second half is this.generateReply()
  // sets new sudoku puzzle
  createNewPuzzle = async (difficulty: string) => {
    const theme = await this.database.getTheme();
    this.setNewPuzzleData(difficulty);
    this.imageHandler.regenerateData(theme, this.puzzleData);
  }

  private setNewPuzzleData = (difficulty: string) => {
    const puzzle = this.getNewLine(difficulty);
    this.puzzleData = {
      difficulty: difficulty,
      defaultPuzzle: puzzle,
      currentPuzzle: puzzle,
      pencilMarkings: "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
    }
  }
  
  private getNewLine = (difficulty: string) => {
    const lines = fs.readFileSync(`${sudokuPuzzlePath}${difficulty.toLowerCase()}.txt`).toString().split(`\n`);
    const randomLine = lines[Math.floor(Math.random() * lines.length)];
    return randomLine.substring(13, 94);
  }
  
  // generates discord embed given a sudoku board canvas
  private generateEmbed = async (board: Canvas.Canvas) => {
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
  
  placeDigit = (row: number, col: number, digit: number) => {}
  
  removeDigit = (row: number, col: number) => {}
  
  highlightDigit = (digit: number) => {}
  
  private getDigitIndicies = (digit: number) => {}
  
  // first half of [pencil] [place] discord command
  // second half is this.generateReply()
  // add or remove pencil marking with specified digit at specified row and column
  pencilPlace = (digit: number, row: number, col: number) => {
    const pencilGroupIndex = row*9 + col
  }
  
  // first half of [pencil] [clear] discord command
  // second half is this.generateReply()
  // clear all pencil markings at specified row and column
  pencilClear = (row: number, col: number) => {}

  resetPuzzle = () => {}

  solveSudoku = () => {}

  // second half of commands that change puzzle data in some way
  // updates board, updates message, returns an embed to be attached to updated message in discord
  generateReply = async (message: Message) => {
    this.message = message;
    const theme = await this.database.getTheme();
    const board = this.imageHandler.createBoard(theme);
    return await this.generateEmbed(board);
  }

  // make sure command input data is valid
  verifyInput = (input: string[]): { verified: boolean, output: number[] } => {
    const output = [];
    let verified = true;
    for (const value of input) {
      if (!+value) {
        verified = false;
        break;
      };
      output.push(+value);
    }
    return { verified: verified, output: [...output] }
  }

  // [theme] command
  // updates database and session with new theme
  changeTheme = async (theme: string): Promise<InteractionReplyOptions> => {
    const newTheme = await this.database.changeTheme(theme);
    const board = this.imageHandler.regenerateAll(newTheme, this.puzzleData);
    return await this.generateEmbed(board);
  }
  
}

export default SudokuHandler;
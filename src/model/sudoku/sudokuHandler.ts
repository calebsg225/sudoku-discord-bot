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

    this.imageHandler.regenerateAll(theme, this.puzzleData);
    const board = this.imageHandler.createBoard(theme);
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
  
  private updatePuzzleData = (valueToUpdate: string, newValue: string, index: number = -1) => {
    if (index < 0) {
      this.puzzleData.difficulty = newValue;
    } else {
      this.puzzleData[valueToUpdate] =
        this.puzzleData[valueToUpdate].substring(0, index)
        + newValue
        + this.puzzleData[valueToUpdate].substring(index+1);
    }
  }
  
  // gets a new puzzle from txt file containing puzzles of specified difficulty
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
  
  placeDigit = async (digit: number, row: number, col: number) => {
    const theme = await this.database.getTheme();
    [ row, col ] = this.zeroIndex([row, col]);
    const digitIndex = row*9 + col;
    const { currentPuzzle: curPuz, defaultPuzzle: defPuz, pencilMarkings: marks } = this.puzzleData;

    if (+defPuz[digitIndex]) return;

    this.imageHandler.clearSquare(row, col);

    if (!+curPuz[digitIndex]) {
      // there is no digit in specified location
      this.imageHandler.placeDigit(theme, digit, row, col);
      this.updatePuzzleData('currentPuzzle', `${digit}`, digitIndex);
    }
    else if (+curPuz[digitIndex] === digit) {
      // the digit is already in specified location
      this.imageHandler.populatePencilMarkingsInSquare(theme, row, col, marks.substring(digitIndex*9, digitIndex*9+9));
      this.updatePuzzleData('currentPuzzle', `0`, digitIndex);
    }
    else {
      // 
      this.imageHandler.placeDigit(theme, digit, row, col);
      this.updatePuzzleData('currentPuzzle', `0`, digitIndex);
    }
  }
  
  removeDigit = (row: number, col: number) => {}
  
  highlightDigit = (digit: number) => {}
  
  private getDigitIndicies = (digit: number) => {}

  // subtract 1 from inputed values
  private zeroIndex = (nums: number[]): number[] => {
    nums.forEach((num, i) => nums[i]--);
    return nums;
  }

  pencil = async (digits: number[], row: number, col: number) => {
    const theme = await this.database.getTheme();
    [ row, col ] = this.zeroIndex([row, col]);
    const digitIndex = row*9 + col;
    const pencilGroupIndex = digitIndex*9;
    
    const { defaultPuzzle: defPuz, currentPuzzle: curPuz, pencilMarkings: marks } = this.puzzleData;
    
    // dont do anything if digit is a default digit;
    if (+defPuz[digitIndex]) return;

    if (+curPuz[digitIndex]) {
      this.imageHandler.clearSquare(row, col);
      this.imageHandler.populatePencilMarkingsInSquare(theme, row, col, marks.substring(pencilGroupIndex, pencilGroupIndex+9));
      this.updatePuzzleData('currentPuzzle', '0', digitIndex);
    }

    for (const digit of digits) {
      if (+marks[pencilGroupIndex + digit - 1]) {
        this.imageHandler.removePencilMarking(digit-1, row, col);
        this.updatePuzzleData('pencilMarkings', '0', pencilGroupIndex + digit-1);
      } else {
        this.imageHandler.addPencilMarking(theme, digit-1, row, col);
        this.updatePuzzleData('pencilMarkings', `${digit}`, pencilGroupIndex + digit-1);
      }
    }
  }
  
  // first half of [pencil] [place] discord command
  // second half is this.generateReply()
  // add or remove pencil marking with specified digit at specified row and column
  pencilPlace = async (digit: number, row: number, col: number): Promise<void> => {
    const theme = await this.database.getTheme();
    [ digit, row, col ] = this.zeroIndex([digit, row, col]);
    const digitIndex = row*9 + col;
    const pencilGroupIndex = digitIndex*9 + digit;
    const { defaultPuzzle: defPuz, currentPuzzle: curPuz, pencilMarkings: marks } = this.puzzleData;

    if (+defPuz[digitIndex]) return;

    // if there is a digit placed here, remove it.
    if (+curPuz[digitIndex]) {
      this.imageHandler.clearSquare(row, col);
      this.imageHandler.populatePencilMarkingsInSquare(theme, row, col, marks.substring(pencilGroupIndex, pencilGroupIndex+9));
      this.updatePuzzleData('currentPuzzle', `0`, digitIndex);
    }
    
    // toggle pencil marking in puzzle data and on board
    if (+marks[pencilGroupIndex]) {
      this.imageHandler.removePencilMarking(digit, row, col);
      this.updatePuzzleData('pencilMarkings', `0`, pencilGroupIndex);
    } else {
      this.imageHandler.addPencilMarking(theme, digit, row, col);
      this.updatePuzzleData('pencilMarkings', `${digit+1}`, pencilGroupIndex);
    }

  }
  
  // first half of [pencil] [clear] discord command
  // second half is this.generateReply()
  // clear all pencil markings at specified row and column
  pencilClear = async (row: number, col: number): Promise<void> => {}

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
  // removes duplicate nums if desired
  verifyInput = (input: number, clean: boolean = false): { verified: boolean, output: number[] } => {
    const digits = clean ? [...new Set(input.toString().split(''))] : input.toString().split('');
    const output = [];
    let verified = true;
    for (const value of digits) {
      if (!+value) {
        verified = false;
        break;
      };
      output.push(+value);
    }
    return { verified: verified, output: output }
  }

  // first half of [theme] discord command
  // updates database and session with new theme
  changeTheme = async (theme: string) => {
    const newTheme = await this.database.changeTheme(theme);
    this.imageHandler.regenerateAll(newTheme, this.puzzleData);
  }
  
}

export default SudokuHandler;
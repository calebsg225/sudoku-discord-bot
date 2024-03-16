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
  private highlighted: number; // digit currently highlighted. 0 if none.
  private defaultMarks: string;

  constructor(user: User) {
    this.user = user;
    this.solver = new SudokuSolver; // class to handle puzzle checking and solving
    this.database = new SudokuDatabaseHandler(this.user.id);
    this.imageHandler = new SudokuIamgeHandler(); // class to handle sudoku image
  }

  // [sudoku] discord command
  // handles initial puzzle creation and embed generation
  init = async (difficulty: string, message: Message): Promise<InteractionReplyOptions> => {
    const savedGames = await this.database.getSavedGames();
    const completedGames = await this.database.getCompletedGames();
    const theme = await this.database.getTheme();

    this.message = message;
    
    this.highlighted = 0;
    this.defaultMarks = "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"

    this.setNewPuzzleData(difficulty, savedGames, completedGames);

    this.imageHandler.regenerateAll(theme, this.puzzleData, this.highlighted);
    const board = this.imageHandler.createBoard(theme);
    return await this.generateEmbed(board);
  }

  // first half of [new] discord command
  // second half is this.generateReply()
  // sets new sudoku puzzle
  createNewPuzzle = async (difficulty: string) => {
    const savedGames = await this.database.getSavedGames();
    const completedGames = await this.database.getCompletedGames();
    const theme = await this.database.getTheme();

    this.setNewPuzzleData(difficulty, savedGames, completedGames);
    this.imageHandler.regenerateData(theme, this.puzzleData, this.highlighted);
  }

  private setNewPuzzleData = (difficulty: string, savedGames: Map<string, any>, completedGames: Map<string, any>) => {
    const puzzle = this.getNewLine(difficulty, savedGames, completedGames);
    this.puzzleData = {
      difficulty: difficulty,
      defaultPuzzle: puzzle,
      currentPuzzle: puzzle,
      pencilMarkings: this.defaultMarks
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
  private getNewLine = (difficulty: string, savedGames: Map<string, any>, completedGames: Map<string, any>) => {
    const lines = fs.readFileSync(`${sudokuPuzzlePath}${difficulty.toLowerCase()}.txt`).toString().split(`\n`);
    let randomLine: string;
    do {
      randomLine = lines[Math.floor(Math.random() * lines.length)];
    }
    while ( completedGames.has(randomLine) || savedGames.has(randomLine) );
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
  
  // first half of [place] discord command
  // second half id this.generateReply()
  // places a digit at specified location
  placeDigit = async (digit: number, row: number, col: number) => {
    const theme = await this.database.getTheme();
    [ row, col ] = this.zeroIndex([row, col]);
    const digitIndex = row*9 + col;
    const { currentPuzzle: curPuz, defaultPuzzle: defPuz, pencilMarkings: marks } = this.puzzleData;

    if (+defPuz[digitIndex]) return;

    this.imageHandler.clearSquare(row, col);

    if (!+curPuz[digitIndex]) {
      // there is no digit in specified location
      this.imageHandler.placeDigit(theme, digit, row, col, this.isHighlighted());
      this.updatePuzzleData('currentPuzzle', `${digit}`, digitIndex);
    }
    else if (+curPuz[digitIndex] === digit) {
      // the digit is already in specified location
      this.imageHandler.populatePencilMarkingsInSquare(theme, row, col, marks.substring(digitIndex*9, digitIndex*9+9), this.highlighted);
      this.updatePuzzleData('currentPuzzle', `0`, digitIndex);
    }
    else {
      // 
      this.imageHandler.placeDigit(theme, digit, row, col, this.isHighlighted());
      this.updatePuzzleData('currentPuzzle', `0`, digitIndex);
    }
  }
  
  // first half of [hl] discord command
  // second half is this.generateReply()
  // highlight specified digit at all locations where digit is visible
  highlightDigit = async (digit: number) => {
    const theme = await this.database.getTheme();

    if (this.highlighted) {
      this.highlightLoop(theme, this.highlighted, true);
    }

    if (this.highlighted !== digit) {
      this.highlightLoop(theme, digit);
      this.highlighted = digit;
    } else {
      this.highlighted = 0;
    }
    
  }

  private highlightLoop = (theme: string, digit: number, removeHighlight: boolean = false) => {
    const { defaultPuzzle: defPuz, currentPuzzle: curPuz, pencilMarkings: marks } = this.puzzleData;

    for (let i = 0; i < curPuz.length; i++) {

      const col = i%9;
      const row = (i-col)/9;
      const isDefault = +defPuz[i] > 0;

      if ( +curPuz[i] === digit ) {
        // highlight main digit
        this.imageHandler.hightlightDigit(theme, digit, row, col, removeHighlight, false, isDefault);
      } else if ( !+curPuz[i] && +marks[i*9 + (digit-1)] === digit) {
        // highlight pencil marking
        this.imageHandler.hightlightDigit(theme, digit, row, col, removeHighlight, true, isDefault);
      }

    }
  }

  // returns true if any digit is highlighted
  private isHighlighted = (): boolean => {
    return this.highlighted > 0;
  }

  // subtract 1 from inputed values
  private zeroIndex = (nums: number[]): number[] => {
    nums.forEach((num, i) => nums[i]--);
    return nums;
  }
  
  // first half of [pencil] discord command
  // second half is this.generateReply()
  // add or remove pencil marking with specified digit(s) at specified row and column
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
      this.imageHandler.populatePencilMarkingsInSquare(theme, row, col, marks.substring(pencilGroupIndex, pencilGroupIndex+9), this.highlighted);
      this.updatePuzzleData('currentPuzzle', '0', digitIndex);
    }

    for (const digit of digits) {
      if (+marks[pencilGroupIndex + digit - 1]) {
        this.imageHandler.removePencilMarking(digit-1, row, col);
        this.updatePuzzleData('pencilMarkings', '0', pencilGroupIndex + digit-1);
      } else {
        this.imageHandler.addPencilMarking(theme, digit-1, row, col, this.highlighted === digit);
        this.updatePuzzleData('pencilMarkings', `${digit}`, pencilGroupIndex + digit-1);
      }
    }
  }

  // first half of [reset] discord command
  // second half is this.generateReply()
  // resets puzzle data
  resetPuzzle = async () => {
    const theme = await this.database.getTheme();
    this.highlighted = 0;
    this.puzzleData.currentPuzzle = this.puzzleData.defaultPuzzle;
    this.puzzleData.pencilMarkings = this.defaultMarks;
    this.imageHandler.regenerateData(theme, this.puzzleData, this.highlighted);
  }

  solveSudoku = () => {}

  // final part of commands that update puzzle data in some way
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
    this.imageHandler.regenerateAll(newTheme, this.puzzleData, this.highlighted);
  }

  viewSaved = async () => {}

  // used in the [save] and [quit] discord commands
  saveGame = async (): Promise<void> => {
    await this.database.addGame(this.puzzleData);
  }
  
}

export default SudokuHandler;
import SudokuIamgeHandler from "./sudokuImageGeneration";
import SudokuSolver from "./sudokuSolver";
import SudokuDatabaseHandler from "./sudokuDatabase";
import { PuzzleData, ViewModeType } from "./types/sudokuTypes";
import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, InteractionReplyOptions, Message, User } from "discord.js";
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

  viewMode: boolean; // true if viewing saved or completed games
  viewing: number; // index of game currently being viewed
  games: PuzzleData[]; // games being viewed. Empty if not in viewing mode.

  private digits: Set<string>;
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
    
    this.highlighted = 0;
    this.defaultMarks = "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
    this.digits = new Set(['1','2', '3', '4', '5', '6', '7', '8', '9']);

    this.viewMode = false;

    this.setNewPuzzleData(difficulty, savedGames, completedGames);

    this.imageHandler.regenerateAll(theme, this.puzzleData, this.highlighted);
    return await this.generateReply(message);
  }

  // first half of [new] discord command
  // second half is this.generateReply()
  // sets new sudoku puzzle
  createNewPuzzle = async (difficulty: string) => {
    const savedGames = await this.database.getSavedGames();
    const completedGames = await this.database.getCompletedGames();

    this.highlighted = 0;

    this.setNewPuzzleData(difficulty, savedGames, completedGames);
    this.imageHandler.regenerateData(this.puzzleData, this.highlighted);
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
  
  // used to update puzzle data when using the [place] and [pencil] commands
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

  // generate attachment image from puzzle board canvas
  private generateAttachment = async (board: Canvas.Canvas) => {
    return new AttachmentBuilder(await board.encode('png'), { name: "sudoku.png" });
  }
  
  // generates base discord embed used for all scenerios
  private generateBaseEmbed = async (board: Canvas.Canvas, title: string) => {
    const attachment = await this.generateAttachment(board);
    const embed = new EmbedBuilder()
      .setTitle(title)
      .setImage('attachment://sudoku.png')
      .setColor('DarkButNotBlack');
    return {embed, attachment};
  }

  // generates embed for viewing saved or completed games
  private generateViewingEmbed = async (board: Canvas.Canvas, title: string, gameCount: number, viewingType: ViewModeType) => {
    const {embed, attachment} = await this.generateBaseEmbed(board, title);
    embed.setDescription(`Difficulty: \`${this.games[this.viewing].difficulty}\``);
    embed.setFooter({text: `${this.viewing+1}/${gameCount} ${viewingType} Games`});
    return {embed, attachment};
  }

  // make buttons for nav for viewing saved or completed games
  private makeButton = (id: string, label: string, style: ButtonStyle) => {
    return new ButtonBuilder()
      .setCustomId(id)
      .setLabel(label)
      .setStyle(style)
  }

  private buttonRowGenerator = (writeAccess: boolean): ActionRowBuilder<ButtonBuilder> => {
    const buttons = [];
    // add [left] and [right] arrow buttons for navigation
    buttons.push(...[
      this.makeButton('left', '<=', ButtonStyle.Primary),
      this.makeButton('right', '=>', ButtonStyle.Primary)
    ]);

    // add [load] and [delete] options for viewing saved games
    if (writeAccess) {
      buttons.push(...[
        this.makeButton('load', 'Load', ButtonStyle.Success),
        this.makeButton('delete', 'Delete', ButtonStyle.Danger)
      ]);
    }

    // add [exit] button for leaving the menu
    buttons.push(
      this.makeButton('exit', 'Exit', ButtonStyle.Secondary)
    );

    return new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons);

  }
  
  // first half of [place] discord command
  // second half id this.generateReply()
  // places a digit at specified location
  placeDigit = async (digit: number, row: number, col: number) => {
    [ row, col ] = this.zeroIndex([row, col]);
    const digitIndex = row*9 + col;
    const { currentPuzzle: curPuz, defaultPuzzle: defPuz, pencilMarkings: marks } = this.puzzleData;

    if (+defPuz[digitIndex]) return;

    this.imageHandler.clearSquare(row, col);

    if (!+curPuz[digitIndex]) {
      // there is no digit in specified location
      this.imageHandler.placeDigit(digit, row, col, this.highlighted === digit);
      this.updatePuzzleData('currentPuzzle', `${digit}`, digitIndex);
    }
    else if (+curPuz[digitIndex] === digit) {
      // the digit is already in specified location
      this.imageHandler.populatePencilMarkingsInSquare(row, col, marks.substring(digitIndex*9, digitIndex*9+9), this.highlighted, false);
      this.updatePuzzleData('currentPuzzle', `0`, digitIndex);
    }
    else {
      this.imageHandler.placeDigit(digit, row, col, this.isHighlighted());
      this.updatePuzzleData('currentPuzzle', `0`, digitIndex);
    }
  }
  
  // first half of [hl] discord command
  // second half is this.generateReply()
  // highlight specified digit at all locations where digit is visible
  highlightDigit = (digit: number) => {

    if (this.highlighted) {
      this.highlightLoop(this.highlighted, true);
    }

    if (this.highlighted !== digit) {
      this.highlightLoop(digit);
      this.highlighted = digit;
    } else {
      this.highlighted = 0;
    }
    
  }

  private highlightLoop = (digit: number, removeHighlight: boolean = false) => {
    const { defaultPuzzle: defPuz, currentPuzzle: curPuz, pencilMarkings: marks } = this.puzzleData;

    for (let i = 0; i < curPuz.length; i++) {

      const col = i%9;
      const row = (i-col)/9;
      const isDefault = +defPuz[i] > 0;

      if ( +curPuz[i] === digit ) {
        // highlight main digit
        this.imageHandler.hightlightDigit(digit, row, col, removeHighlight, false, isDefault);
      } else if ( !+curPuz[i] && +marks[i*9 + (digit-1)] === digit) {
        // highlight pencil marking
        this.imageHandler.hightlightDigit(digit, row, col, removeHighlight, true, isDefault);
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
  pencil = (digits: number[], row: number, col: number) => {
    [ row, col ] = this.zeroIndex([row, col]);
    const digitIndex = row*9 + col;
    const pencilGroupIndex = digitIndex*9;
    
    const { defaultPuzzle: defPuz, currentPuzzle: curPuz, pencilMarkings: marks } = this.puzzleData;
    
    // dont do anything if digit is a default digit;
    if (+defPuz[digitIndex]) return;

    if (+curPuz[digitIndex]) {
      this.imageHandler.clearSquare(row, col);
      this.imageHandler.populatePencilMarkingsInSquare(row, col, marks.substring(pencilGroupIndex, pencilGroupIndex+9), this.highlighted, false);
      this.updatePuzzleData('currentPuzzle', '0', digitIndex);
    }

    for (const digit of digits) {
      if (+marks[pencilGroupIndex + digit - 1]) {
        this.imageHandler.removePencilMarking(digit-1, row, col);
        this.updatePuzzleData('pencilMarkings', '0', pencilGroupIndex + digit-1);
      } else {
        this.imageHandler.addPencilMarking(digit-1, row, col, this.highlighted === digit, false);
        this.updatePuzzleData('pencilMarkings', `${digit}`, pencilGroupIndex + digit-1);
      }
    }
  }

  // first half of [reset] discord command
  // second half is this.generateReply()
  // resets puzzle data
  resetPuzzle = () => {
    this.highlighted = 0;
    this.puzzleData.currentPuzzle = this.puzzleData.defaultPuzzle;
    this.puzzleData.pencilMarkings = this.defaultMarks;
    this.imageHandler.regenerateData(this.puzzleData, this.highlighted);
  }

  // first half of [check] discord command
  // checks that current puzzle is a valid sudoku solution
  // if so, edits database and generates new puzzle of same difficulty
  checkSudoku = async () => {
    const solved = this.solver.check(this.puzzleData.currentPuzzle);
    if (!solved) return {solved};

    this.imageHandler.regenerateData(this.puzzleData, 0, true);
    const board = this.imageHandler.createBoard();

    // create attachment of completed game
    const attachment = await this.generateAttachment(board);
    const completedReply = {
      content: `Congratulations, you have completed the Sudoku puzzle!\nYou can view completed games using the \`/view\` command.`,
      files: [attachment]
    }

    // remove game from saved games, move to completed
    await this.database.deleteSavedGame(this.puzzleData.defaultPuzzle);
    await this.database.addGame(this.puzzleData, true);

    // create a new game of same difficulty
    this.createNewPuzzle(this.puzzleData.difficulty);
    return { solved, completedReply, difficulty: this.puzzleData.difficulty };
  }
  
  solveSudoku = () => {}

  // final part of commands that update puzzle data in some way
  // updates board, updates message, returns an embed to be attached to updated message in discord
  generateReply = async (message: Message) => {
    this.message = message;
    const board = this.imageHandler.createBoard();
    const title = `@${this.user.displayName}'s Sudoku, Difficulty: \`${this.puzzleData.difficulty}\``;
    const { embed, attachment } = await this.generateBaseEmbed(board, title);
    const reply = {
      embeds: [embed],
      files: [attachment]
    }
    return reply;
  }

  // make sure command input data is valid
  // removes duplicate nums if desired
  verifyInput = (input: string, clean: boolean = false): { verified: boolean, output: number[] } => {
    const digits = clean ? [...new Set(input.split(''))] : input.split('');
    const output = [];
    let verified = true;
    for (const value of digits) {
      if (!this.digits.has(value)) {
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
  
  // converts map of saved or completed games to an array contianing puzzle data
  private generateViewPuzzleData = (inputGames: Map<string, any>) => {
    const games: PuzzleData[] = [];
    inputGames.forEach((v, k) => {
      games.push({
        difficulty: v.difficulty,
        defaultPuzzle: k,
        currentPuzzle: v.currentPuzzle,
        pencilMarkings: v.pencilMarkings
      });
    });
    return games;
  }

  // [left] and [right] buttons for [view] discord command
  // move left or right
  shiftGame = async (viewType: ViewModeType, direction: "left" | "right") => {

    if (direction === "left") {
      this.viewing--;
      if (this.viewing < 0) {
        this.viewing = this.games.length - 1;
      }
    } else {
      this.viewing++;
      if (this.viewing >= this.games.length) {
        this.viewing = 0;
      }
    }
    this.imageHandler.regenerateData(this.games[this.viewing], 0, viewType === "Completed");
    const board = this.imageHandler.createBoard();

    const { embed, attachment } = await this.generateViewingEmbed(board, `@${this.user.displayName}'s ${viewType} Games`, this.games.length, viewType);
    const updatedReply = {
      embeds: [embed],
      files: [attachment]
    }
    return updatedReply;
  }

  // [load] button for [view] discord command
  // load saved game
  loadSavedGame = async () => {
    this.puzzleData = this.games[this.viewing];
    this.highlighted = 0;
  }

  // [delete] button for [view] discord command
  // delete saved game
  deleteSavedGame = async () => {
    await this.database.deleteSavedGame(this.games[this.viewing].defaultPuzzle);
    this.games.splice(this.viewing, 1);
    if (this.viewing >= this.games.length) this.viewing--;

    this.imageHandler.regenerateData(this.games[this.viewing], 0);
    const board = this.imageHandler.createBoard();

    const { embed, attachment } = await this.generateViewingEmbed(board, `@${this.user.displayName}'s Saved Games`, this.games.length, "Saved");
    return {
      embeds: [embed],
      files: [attachment]
    }
  }

  // [exit] button for [view] discord command
  // also the way to exit view mode for [delete] button and timeout
  // exit viewing mode
  exitViewingMode = async (message: Message) => {
    this.viewMode = false;
    delete this.games;
    delete this.viewing;

    this.imageHandler.regenerateData(this.puzzleData, this.highlighted);
    return await this.generateReply(message);
  }

  // check if there are no games to view
  // used for [delete] button
  hasNone = () => {
    return this.games.length === 0;
  }

  // verify there is at least one game to view
  verifyViewData = async (viewType: ViewModeType) => {
    const games = viewType === "Saved" ? await this.database.getSavedGames() : await this.database.getCompletedGames();
    if (!games.size) return false;

    this.viewMode = true;
    this.games = this.generateViewPuzzleData(games);
    this.viewing = 0;
    return true;
  }

  // main section of [saved] and [completed] discord commands
  // linked to buttons [left] [right] [load] [save] [exit]
  // used to view games in database, if any
  view = async (message: Message, viewType: ViewModeType) => {
    this.viewMode = true;
    this.message = message;

    this.games = this.generateViewPuzzleData(viewType === "Saved" ? await this.database.getSavedGames() : await this.database.getCompletedGames());
    this.viewing = 0;

    // generate first of saved or completed games with no highlights
    this.imageHandler.regenerateData(this.games[this.viewing], 0, viewType === "Completed");
    const board = this.imageHandler.createBoard();

    // generate embed and attachment for veiwing menu
    const { embed, attachment } = await this.generateViewingEmbed(board, `@${this.user.displayName}'s ${viewType} Games`, this.games.length, viewType);

    // generate button row for interacting with menu
    const buttons = this.buttonRowGenerator(viewType === "Saved");

    const reply = {
      embeds: [embed],
      files: [attachment],
      components: [buttons]
    }
    return reply;
  }

  // used in the [save] and [quit] discord commands
  saveGame = async (): Promise<void> => {
    await this.database.addGame(this.puzzleData);
  }
  
}

export default SudokuHandler;
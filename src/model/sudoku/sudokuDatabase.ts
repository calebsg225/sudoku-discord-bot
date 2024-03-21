// handles calls to sudoku database

import mongoose from "mongoose";
import { SudokuUsers, SudokuGame, Preferences } from "../../schemas/sudoku/sudokuUsers";
import { PuzzleData } from "./types/sudokuTypes";

class SudokuDatabaseHandler {
  userId: string
  constructor (userId: string) {
    this.userId = userId;
    this.createNewSudokuUser();
  }

  // check if sudoku user document exists for user
  private isNewUser = async (): Promise<boolean> => {
    return !(await SudokuUsers.findOne({discordUserId: this.userId}));
  }

  // add new sudoku user document in database
  private createNewSudokuUser = async (): Promise<void> => {
    if (!(await this.isNewUser())) return;
    const userPrefs = new Preferences({
      theme: 'dark'
    });

    await new SudokuUsers({
      _id: new mongoose.Types.ObjectId,
      discordUserId: this.userId,
      preferences: userPrefs,
      savedGames: new Map,
      completedGames: new Map
    }).save().catch(console.error);
  }

  // fetches and returns user data
  private fetchUserData = async () => {
    return await SudokuUsers.findOne({discordUserId: this.userId});
  }

  // add a game to saved games or completed games
  addGame = async (puzzleData: PuzzleData, completedGame: boolean = false): Promise<void> => {
    const sudokuUserData = await this.fetchUserData();
    
    const { defaultPuzzle, currentPuzzle, pencilMarkings, difficulty } = puzzleData;
    const newGame = new SudokuGame({
      difficulty: difficulty,
      currentPuzzle: currentPuzzle,
      pencilMarkings: pencilMarkings
    });

    completedGame ? sudokuUserData.completedGames.set(defaultPuzzle, newGame)
                  : sudokuUserData.savedGames.set(defaultPuzzle, newGame);
    await sudokuUserData.save();
  }

  // get all previously saved games from database
  getSavedGames = async (): Promise<Map<string, any>> => {
    const sudokuUserData = await this.fetchUserData();
    return sudokuUserData.savedGames;
  }

  // delete a saved game from database
  deleteSavedGame = async (gameToDelete: string): Promise<void> => {
    const sudokuUserData = await this.fetchUserData();
    sudokuUserData.savedGames.delete(gameToDelete);
    await sudokuUserData.save();
  }

  // get all previously completed games from database
  getCompletedGames = async (): Promise<Map<string, any>> => {
    const sudokuUserData = await this.fetchUserData();
    return sudokuUserData.completedGames;
  }

  // get current theme from user preferences
  getTheme = async (): Promise<string> => {
    const sudokuUserData = await this.fetchUserData();
    return sudokuUserData.preferences.theme;
  }

  // update user preferences with new theme, then returns new theme from database
  changeTheme = async (theme: string): Promise<string> => {
    await SudokuUsers.updateOne({discordUserId: this.userId}, {$set: {preferences: {theme: theme}}});
    return await this.getTheme();
  }
}

export default SudokuDatabaseHandler;
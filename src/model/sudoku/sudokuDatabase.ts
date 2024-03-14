// handles calls to sudoku database

import mongoose from "mongoose";
import { SudokuUsers, SudokuGame, Preferences } from "../../schemas/sudoku/sudokuUsers";

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

  // get current theme from user preferences
  getTheme = async (): Promise<string> => {
    const sudokuUserData = await SudokuUsers.findOne({discordUserId: this.userId});
    return sudokuUserData.preferences.theme;
  }

  // update user preferences with new theme, then returns new theme from database
  changeTheme = async (theme: string): Promise<string> => {
    await SudokuUsers.updateOne({discordUserId: this.userId}, {$set: {preferences: {theme: theme}}});
    return await this.getTheme();
  }
}

export default SudokuDatabaseHandler;
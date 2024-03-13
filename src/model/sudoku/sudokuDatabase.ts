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

  getTheme = async (): Promise<string> => {
    const sudokuUserData = await SudokuUsers.findOne({discordUserId: this.userId});
    return sudokuUserData.preferences.theme;
  }

  changeTheme = async (theme: string): Promise<void> => {
    await SudokuUsers.updateOne({discordUserId: this.userId}, {$set: {preferences: {theme: theme}}});
  }
}

export default SudokuDatabaseHandler;
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const sudokuGame = new Schema({
  difficulty: String,
  currentPuzzle: String,
  pencilMarkings: String
}, {
  _id: false
});

const preferences = new Schema({
  theme: String
}, {
  _id: false
});

const sudokuUsers = new Schema({
  _id: mongoose.Types.ObjectId,
  discordUserId: String,
  preferences: preferences,
  savedGames: { // key is default puzzle
    type: Map,
    of: sudokuGame
  },
  completedGames: { // key is default puzzle
    type: Map,
    of: sudokuGame
  }
});

const SudokuUsers = model("SudokuUser", sudokuUsers, "SudokuUsers");
const SudokuGame = model("SudokuGame", sudokuGame);
const Preferences = model("Preferences", preferences);

export { SudokuUsers, SudokuGame, Preferences };
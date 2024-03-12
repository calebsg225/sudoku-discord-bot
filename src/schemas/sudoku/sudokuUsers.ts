import mongoose from "mongoose";
const { Schema, model } = mongoose;

const SudokuGames = new Schema({
  difficulty: String,
  currentPuzzle: String
}, {
  _id: false
});

const Preferences = new Schema({
  theme: String
}, {
  _id: false
});

const SudokuUsers = new Schema({
  _id: mongoose.Types.ObjectId,
  discordUserId: String,
  preferences: Preferences,
  savedGames: [SudokuGames],
  completedGames: [SudokuGames]
});

export default model("SudokuUser", SudokuUsers, "SudokuUsers");
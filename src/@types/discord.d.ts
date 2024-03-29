// extend default discord.js classes

import { Collection } from "discord.js";
import SlashCommand from "../commands/_interface/SlashCommand";
import SudokuHandler from "../model/sudoku/sudokuHandler";

declare module "discord.js" {
  export interface Client {
    commands: Collection<string, SlashCommand>,
    cooldowns: Collection<string, Collection<string, number>>,
    sudokuSessions: Collection<string, SudokuHandler>
  }
}
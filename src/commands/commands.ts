import { Collection } from "discord.js";
import SlashCommand from "./_interface/SlashCommand";

// util commands
import { reload } from "./utils/reload";

// sudoku session commands
import { _new } from "./sudoku/session/new";
import { sudoku } from "./sudoku/session/sudoku";

// create commands collection to be mounted to client
const commands = new Collection<string, SlashCommand>()
  .set(reload.data.name, reload)
  .set(_new.data.name, _new)
  .set(sudoku.data.name, sudoku)

// remove certain commands from global deployment
export const excludeCommands = new Set([
  reload
]);

export default commands;
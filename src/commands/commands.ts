import { Collection } from "discord.js";
import SlashCommand from "./_interface/SlashCommand";

// util commands
import { reload } from "./utils/reload";

// sudoku session commands
import { _new } from "./sudoku/mechanics/new";
import { sudoku } from "./sudoku/session/sudoku";
import { quit } from "./sudoku/session/quit";
import { theme } from "./sudoku/user/theme";

// create global commands collection to be mounted to client
const globalCommands = new Collection<string, SlashCommand>()
  .set(_new.data.name, _new)
  .set(sudoku.data.name, sudoku)
  .set(quit.data.name, quit)
  .set(theme.data.name, theme)

// create dev commands collection
const devCommands = new Collection<string, SlashCommand>()
  .set(reload.data.name, reload)

export { globalCommands, devCommands};
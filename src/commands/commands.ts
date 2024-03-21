import { Collection } from "discord.js";
import SlashCommand from "./_interface/SlashCommand";

// util commands
import { reload } from "./utils/reload";

// sudoku session commands
import { _new } from "./sudoku/mechanics/new";
import { sudoku } from "./sudoku/session/sudoku";
import { quit } from "./sudoku/session/quit";
import { theme } from "./sudoku/user/theme";
import { pencil } from "./sudoku/mechanics/pencil";
import { place } from "./sudoku/mechanics/place";
import { hl } from "./sudoku/mechanics/hl";
import { reset } from "./sudoku/mechanics/reset";
import { save } from "./sudoku/database/save";
import { view } from "./sudoku/database/view";
import { check } from "./sudoku/database/check";

// create global commands collection to be mounted to client
const globalCommands = new Collection<string, SlashCommand>()
  .set(_new.data.name, _new)
  .set(sudoku.data.name, sudoku)
  .set(quit.data.name, quit)
  .set(theme.data.name, theme)
  .set(pencil.data.name, pencil)
  .set(place.data.name, place)
  .set(hl.data.name, hl)
  .set(reset.data.name, reset)
  .set(save.data.name, save)
  .set(view.data.name, view)
  .set(check.data.name, check)

// create dev commands collection
const devCommands = new Collection<string, SlashCommand>()
  .set(reload.data.name, reload)

export { globalCommands, devCommands};
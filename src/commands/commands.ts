import { Collection } from "discord.js";
import SlashCommand from "./_interface/SlashCommand";

// util commands
import { reload } from "./utils/reload";

// sudoku session commands
import { _new } from "./sudoku/session/new";

// create commands collection to be mounted to client
const commands = new Collection<string, SlashCommand>()
  .set(reload.data.name, reload)
  .set(_new.data.name, _new)

export default commands;
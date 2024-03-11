import { Collection } from "discord.js";
import SlashCommand from "./_interface/SlashCommand";

// commands
import { reload } from "./utils/reload";

// create commands collection to be mounted to client
const commands = new Collection<string, SlashCommand>()
  .set(reload.data.name, reload)

export default commands;
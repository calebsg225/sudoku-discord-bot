// extend default discord.js classes

import { Collection } from "discord.js";
import SlashCommand from "../commands/_interface/SlashCommand";

declare module "discord.js" {
  export interface Client {
    commands: Collection<string, SlashCommand>
  }
}
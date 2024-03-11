import { ChatInputCommandInteraction } from "discord.js";

export default interface SlashCommand {
  cooldown?: number;
  path: string,
  data: {
    name: string,
    description: string
  },
  execute: (interaction: ChatInputCommandInteraction) => void
}
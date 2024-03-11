// reload a command through discord without restarting bot

import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import SlashCommand from "../_interface/SlashCommand";
import { DevUserId } from "../../../config.json";

export const reload: SlashCommand = {
  path: `utils`,
  data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('[dev only] reload a slash command')
    .addStringOption(option => 
      option.setName('command')
        .setDescription('command to reload')
        .setRequired(true)
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    if (interaction.user.id !== DevUserId) {
      return interaction.reply({
        content: `This command is for dev use only.`,
        ephemeral: true
      });
    }

    await interaction.reply({
      content: `reload command in developement`,
      ephemeral: true
    })
  }
}
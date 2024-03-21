// check your solution

import { SlashCommandBuilder } from "discord.js";
import SlashCommand from "../../_interface/SlashCommand";

export const check: SlashCommand = {
  path: 'sudoku/mechanics',
  data: new SlashCommandBuilder()
    .setName('check')
    .setDescription('Check your solution.')
    .setDMPermission(false)
  ,
  execute: async (interaction) => {
    const user = interaction.user;

    // verify user has started a session
    if (!interaction.client.sudokuSessions.has(user.id)) {
      return interaction.reply({
        content: `You are not in a sudoku session.\n Please use \`/sudoku\` to begin a session.`,
        ephemeral: true
      });
    }

    const sudokuSession = interaction.client.sudokuSessions.get(user.id);

    // verify user is not viewing games
    if (sudokuSession.viewMode) {
      return interaction.reply({
        content: "You are in view mode.\nPress `Exit` to leave view mode.",
        ephemeral: true
      });
    }

    await interaction.deferReply();
    const message = await interaction.fetchReply();

    // solve here

    await sudokuSession.message.delete();
    const reply = await sudokuSession.generateReply(message);

    await interaction.editReply(reply);
  }
}
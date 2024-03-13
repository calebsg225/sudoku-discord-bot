// change sudoku theme

import { SlashCommandBuilder } from "discord.js";
import SlashCommand from "../../_interface/SlashCommand";

import { themeChoices } from "../../../model/sudoku/choices";

export const theme: SlashCommand = {
  path: 'sudoku/user',
  data: new SlashCommandBuilder()
    .setName('theme')
    .setDescription('Change how your sudoku puzzles look.')
    .setDMPermission(false)
    .addStringOption(option =>
      option.setName('name')
        .setDescription('name of the theme you want to switch to')
        .addChoices(...themeChoices)
        .setRequired(true)
    )
  ,
  execute: async (interaction) => {

    const userId = interaction.user.id;

    if (!interaction.client.sudokuSessions.has(userId)) {
      return interaction.reply({
        content: `You are not in a sudoku session.\n Please use \`/sudoku\` to begin a session.`,
        ephemeral: true
      });
    }

    await interaction.deferReply();
    const message = await interaction.fetchReply();

    const theme = interaction.options.getString('name', true);

    const sudokuSession = interaction.client.sudokuSessions.get(userId);

    // updates database and session with new theme
    await sudokuSession.changeTheme(theme);

    await sudokuSession.message.delete();
    const reply = await sudokuSession.generateReply(message);
    await interaction.editReply(reply);
  }
}
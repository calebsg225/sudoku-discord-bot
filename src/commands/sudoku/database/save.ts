// save current game to db

import { SlashCommandBuilder } from "discord.js";
import SlashCommand from "../../_interface/SlashCommand";
import chalk from "chalk";

export const save: SlashCommand = {
  path: 'sudoku/database',
  data: new SlashCommandBuilder()
    .setName('save')
    .setDescription('Save your current game. Duplicates are overridden.')
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

    await interaction.deferReply({ephemeral: true});

    try {
      // try to save game
      await sudokuSession.saveGame();
      await interaction.editReply(`<@${user.id}> Your game was saved.`);
    } catch (error) {
      console.error(chalk.red(error));
      await interaction.editReply(`<@${user.id}> An error occured while trying to save your game.`);
    }

  }
}
// end sudoku session after saving current game

import { SlashCommandBuilder } from "discord.js";
import SlashCommand from "../../_interface/SlashCommand";
import { decisionChoices } from "../../../model/sudoku/choices";
import chalk from "chalk";

export const quit: SlashCommand = {
  path: 'sudoku/session',
  data: new SlashCommandBuilder()
    .setName('quit')
    .setDescription('end your sudoku session')
    .setDMPermission(false)
    .addStringOption(option => 
      option.setName('save')
        .setDescription('Save your current game?')
        .addChoices(...decisionChoices)
        .setRequired(true)
    ),
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

    await interaction.deferReply();

    const saveCurrentGame = interaction.options.getString('save', true);

    if (saveCurrentGame === "1") {
      try {
        // try to save game
        await sudokuSession.saveGame();
        await interaction.editReply(`Your game was saved. Thank you for playing!`);
        await sudokuSession.message.delete();
        interaction.client.sudokuSessions.delete(user.id);
      } catch (error) {
        console.error(chalk.red(error));
        await interaction.editReply(`An error occured while trying to save your game.\nYour session has not ended.`);
      }
    } else {
      await sudokuSession.message.delete();
      interaction.client.sudokuSessions.delete(user.id);
      await interaction.editReply(`Thank you for playing!`);
    }

  }
}
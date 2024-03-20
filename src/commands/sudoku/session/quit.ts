// end sudoku session after saving current game

import { SlashCommandBuilder } from "discord.js";
import SlashCommand from "../../_interface/SlashCommand";
import chalk from "chalk";

export const quit: SlashCommand = {
  path: 'sudoku/session',
  data: new SlashCommandBuilder()
    .setName('quit')
    .setDescription('end your sudoku session')
    .setDMPermission(false)
    .addBooleanOption(option => 
      option.setName('save')
        .setDescription('Save your current game?')
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

    const saveCurrentGame = interaction.options.getBoolean('save');

    if (saveCurrentGame) {
      try {
        // try to save game
        await sudokuSession.saveGame();
        await interaction.editReply(`Your game was saved. Thank you for playing!`);
      } catch (error) {
        console.error(chalk.red(error));
        return interaction.editReply(`An error occured while trying to save your game.\nYour session has not ended.`);
      }
    }
    
    await sudokuSession.message.delete();
    interaction.client.sudokuSessions.delete(user.id);
    
  }
}
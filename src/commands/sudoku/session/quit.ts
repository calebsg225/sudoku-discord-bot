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

    if (!interaction.client.sudokuSessions.has(user.id)) {
      return interaction.reply({
        content: `You are not in a sudoku session.\n Please use \`/sudoku\` to begin a session.`,
        ephemeral: true
      });
    }

    await interaction.deferReply();
    const message = await interaction.fetchReply();

    const sudokuSession = interaction.client.sudokuSessions.get(user.id);

    const saveCurrentGame = interaction.options.getString('save', true);

    if (saveCurrentGame === "1") {
      try {
        // try to save game
        await sudokuSession.saveGame();
        await interaction.channel.send(`<@${user.id}> Your game was saved.`);
      } catch (error) {
        console.error(chalk.red(error));
        await interaction.channel.send(`<@${user.id}> An error occured while trying to save your game.`);
      }
    }

    await sudokuSession.message.delete();
    interaction.client.sudokuSessions.delete(user.id);

    await interaction.editReply(`Thank you for playing!`);

  }
}
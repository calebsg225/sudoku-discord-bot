// generate a new sudoku puzzle

import SlashCommand from "../../_interface/SlashCommand";
import { SlashCommandBuilder } from "discord.js";
import { difficultyChoices } from "../../../model/sudoku/choices";
import chalk from "chalk";

export const _new: SlashCommand = {
  path: `sudoku/mechanics`,
  data: new SlashCommandBuilder()
    .setName('new')
    .setDescription('generate a new sudoku puzzle')
    .setDMPermission(false)
    .addStringOption(option =>
      option.setName('difficulty')
        .setDescription('difficulty of the new sudoku puzzle')
        .addChoices(...difficultyChoices)
        .setRequired(true)
    ).addBooleanOption(option => 
      option.setName('save')
        .setDescription('Save your current game?')
    ),
  execute: async (interaction) => {
    const userId = interaction.user.id;

    // verify that the user is in a session
    if (!interaction.client.sudokuSessions.has(userId)) {
      return interaction.reply({
        content: `You are not in a sudoku session.\n Please use \`/sudoku\` to begin a session.`,
        ephemeral: true
      });
    }
    
    const sudokuSession = interaction.client.sudokuSessions.get(userId);

    // verify user is not viewing games
    if (sudokuSession.viewMode) {
      return interaction.reply({
        content: "You are in view mode.\nPress `Exit` to leave view mode.",
        ephemeral: true
      });
    }

    await interaction.deferReply();
    const message = await interaction.fetchReply();

    const saveCurrentGame = interaction.options.getBoolean('save');
    const difficulty = interaction.options.getString('difficulty', true);

    if(saveCurrentGame) {
      // attempt to save game
      try {
        await sudokuSession.saveGame();
      } catch (error) {
        console.error(chalk.red(error));
        return interaction.editReply(`An error occured while trying to save your game.\nA new game was not generated.`);
      }
    }

    // generate a new puzzle
    await sudokuSession.createNewPuzzle(difficulty);

    await sudokuSession.message.delete();

    // create new sudoku embed
    const reply = await sudokuSession.generateReply(message);

    await interaction.editReply(reply);

  }
}
// generate a new sudoku puzzle

import SlashCommand from "../../_interface/SlashCommand";
import { SlashCommandBuilder } from "discord.js";

import SudokuHandler from "../../../model/sudoku/sudokuHandler";

import { difficultyChoices } from "../../../model/sudoku/choices";

export const _new: SlashCommand = {
  path: `sudoku/session`,
  data: new SlashCommandBuilder()
    .setName('new')
    .setDescription('generate a new sudoku puzzle')
    .addStringOption(option =>
      option.setName('difficulty')
        .setDescription('difficulty of the new sudoku puzzle')
        .addChoices(...difficultyChoices)
        .setRequired(true)
    ),
  execute: async (interaction) => {
    // verify here
    const userId = interaction.user.id;

    if (interaction.client.sudokuSessions.has(userId)) {
      return interaction.reply({
        content: `You are not in a sudoku session.\n Please use \`/sudoku\` to begin a session.`,
        ephemeral: true
      });
    }
    await interaction.deferReply();
    
  }
}
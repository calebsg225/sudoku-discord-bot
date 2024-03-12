// start a sudoku session

import { SlashCommandBuilder, AttachmentBuilder } from "discord.js";
import SlashCommand from "../../_interface/SlashCommand";

import SudokuHandler from "../../../model/sudoku/sudokuHandler";

import { difficultyChoices } from "../../../model/sudoku/choices";

export const sudoku: SlashCommand = {
  path: `sudoku/session`,
  data: new SlashCommandBuilder()
    .setName('sudoku')
    .setDescription('Begin a sudoku session!')
    .addStringOption(option =>
      option.setName('difficulty')
        .setDescription('difficulty of sudoku puzzle')
        .addChoices(...difficultyChoices)
        .setRequired(true)
    )
  ,
  execute: async (interaction) => {
    const userId = interaction.user.id;

    if (interaction.client.sudokuSessions.has(userId)) {
      return interaction.reply({
        content: `You have already begun a sudoku session!`,
        ephemeral: true
      });
    }

    const difficulty = interaction.options.getString('difficulty', true);

    const sudokuSession = new SudokuHandler(difficulty, userId);

  }
}
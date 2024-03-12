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
    await interaction.deferReply();
    const difficulty = interaction.options.getString('difficulty', true);
    const sudoku = new SudokuHandler(difficulty);
    sudoku.getRandomLine();
    await interaction.editReply(sudoku.puzzleData.defaultPuzzle);
  }
}
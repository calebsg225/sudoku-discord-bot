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
    .setDMPermission(false)
    .addStringOption(option =>
      option.setName('difficulty')
        .setDescription('difficulty of sudoku puzzle')
        .addChoices(...difficultyChoices)
        .setRequired(true)
    )
  ,
  execute: async (interaction) => {
    const user = interaction.user;

    if (interaction.client.sudokuSessions.has(user.id)) {
      return interaction.reply({
        content: `You have already begun a sudoku session!`,
        ephemeral: true
      });
    }

    await interaction.deferReply();
    const message = await interaction.fetchReply();

    const difficulty = interaction.options.getString('difficulty', true);

    // create new sudoku session
    const sudokuSession = new SudokuHandler(user, difficulty, message);
    const reply = await sudokuSession.init();

    interaction.client.sudokuSessions.set(user.id, sudokuSession);

    await interaction.editReply(reply);
  }
}
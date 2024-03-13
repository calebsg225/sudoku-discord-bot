// generate a new sudoku puzzle

import SlashCommand from "../../_interface/SlashCommand";
import { SlashCommandBuilder } from "discord.js";

import { difficultyChoices } from "../../../model/sudoku/choices";

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
    await interaction.deferReply();
    const message = await interaction.fetchReply();

    const difficulty = interaction.options.getString('difficulty', true);

    // get user session data
    const sudokuSession = interaction.client.sudokuSessions.get(userId);

    // generate a new puzzle
    sudokuSession.generateNewPuzzle(difficulty);

    await sudokuSession.message.delete();

    // create new sudoku embed
    const reply = await sudokuSession.generateReply(message);

    await interaction.editReply(reply);

  }
}
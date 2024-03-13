// end sudoku session after saving current game

import { SlashCommandBuilder } from "discord.js";
import SlashCommand from "../../_interface/SlashCommand";
import { SudokuUsers } from "../../../schemas/sudoku/sudokuUsers";
import { decisionChoices } from "../../../model/sudoku/choices";

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
    const userId = interaction.user.id;

    if (!interaction.client.sudokuSessions.has(userId)) {
      return interaction.reply({
        content: `You are not in a sudoku session.\n Please use \`/sudoku\` to begin a session.`,
        ephemeral: true
      });
    }

    await interaction.deferReply();
    const message = await interaction.fetchReply();

    const sudokuSession = interaction.client.sudokuSessions.get(userId);

    const saveCurrentGame = interaction.options.getString('save', true);

    if (saveCurrentGame === "1") {
      //save game here
    }

    await sudokuSession.message.delete();
    interaction.client.sudokuSessions.delete(userId);

    await interaction.editReply(`Thank you for playing!`);

  }
}
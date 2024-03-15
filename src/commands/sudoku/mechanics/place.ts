// place a sudoku digit

import { SlashCommandBuilder } from "discord.js";
import SlashCommand from "../../_interface/SlashCommand";

export const place: SlashCommand = {
  path: 'sudoku/mechanics',
  data: new SlashCommandBuilder()
    .setName('place')
    .setDescription('place a digit at specified row and column')
    .setDMPermission(false)
    .addNumberOption(option =>
      option.setName('position')
        .setDescription('[digit, row, column], Ex. 789 would be digit 7, row 8, column 9')
        .setMinValue(111)
        .setMaxValue(999)
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

    const positions = interaction.options.getNumber('position', true);
    const { verified, output } = sudokuSession.verifyInput(positions);

    if (!verified) {
      return interaction.reply({
        content: 'The position data you have entered is invalid. Please try again.',
        ephemeral: true
      });
    }

    await interaction.deferReply();
    const message = await interaction.fetchReply();

    const [ digit, row, column ] = output;
    await sudokuSession.placeDigit(digit, row, column);

    await sudokuSession.message.delete();
    const reply = await sudokuSession.generateReply(message);

    await interaction.editReply(reply);

  }
}
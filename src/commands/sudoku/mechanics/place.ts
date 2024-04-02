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
      option.setName('digit')
        .setDescription('digit to toggle at specified position(s)')
        .setMinValue(1)
        .setMaxValue(9)
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('positions')
        .setDescription('[row1, column1, row2, column2, etc...], Ex. 8934 would be row 8, col 9 and row 3, col 4')
        .setMinLength(2)
        .setMaxLength(18)
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

    // verify user is not viewing games
    if (sudokuSession.viewMode) {
      return interaction.reply({
        content: "You are in view mode.\nPress `Exit` to leave view mode.",
        ephemeral: true
      });
    }

    const digit = interaction.options.getNumber('digit', true);
    const positions = interaction.options.getString('positions', true);

    // verify digit and position data
    const { verified: verifiedDigit } = sudokuSession.verifyInput(`${digit}`);
    const { verified: verifiedPositions, output: positionOutput } = sudokuSession.verifyInput(positions);

    if (!verifiedDigit || !verifiedPositions || positionOutput.length%2) {
      return interaction.reply({
        content: 'The data you have entered is invalid. Please try again.',
        ephemeral: true
      });
    }

    await interaction.deferReply();
    const message = await interaction.fetchReply();

    // for each of the given verified positions, attempt to place given digit
    for (let i = 0; i < positionOutput.length; i+=2) {
      const row = positionOutput[i];
      const col = positionOutput[i+1];
      await sudokuSession.placeDigit(digit, row, col);
    };

    await sudokuSession.message.delete();
    const reply = await sudokuSession.generateReply(message);

    await interaction.editReply(reply);

  }
}
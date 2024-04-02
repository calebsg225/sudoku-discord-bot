// make pencil marks on a certain square

import { SlashCommandBuilder } from "discord.js";
import SlashCommand from "../../_interface/SlashCommand";

export const pencil: SlashCommand = {
  path: 'sudoku/mechanics',
  data: new SlashCommandBuilder()
    .setName('pencil')
    .setDescription('place or clear pencil markings')
    .setDMPermission(false)
    .addNumberOption(option =>
      option.setName('digits')
        .setDescription('digit(s) to toggle. Ex. 45 will toggle digits 4 and 5. Duplicates will count as one.')
        .setMinValue(1)
        .setMaxValue(999999999)
        .setRequired(true)
    ).addStringOption(option =>
      option.setName('positions')
        .setDescription('[row1, column1, row2, column2, etc...], Ex. 8934 would be row 8, col 9 and row 3, col 4')
        .setMinLength(2)
        .setMaxLength(18)
        .setRequired(true)
    )
  ,
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

    const digits = interaction.options.getNumber('digits', true);
    const position = interaction.options.getString('positions', true);

    // verify digits and positions data
    const { verified: positionsVerified, output: positionsOutput } = sudokuSession.verifyInput(position);
    const { verified: digitsVerified, output: digitsOutput } = sudokuSession.verifyInput(`${digits}`, true);

    // verify user has inputed valid data
    if (!positionsVerified || !digitsVerified || positionsOutput.length%2) {
      return interaction.reply({
        content: 'The data you have entered is invalid. Please try again.',
        ephemeral: true
      });
    }

    await interaction.deferReply();
    const message = await interaction.fetchReply();
    
    for (let i = 0; i < positionsOutput.length; i+=2) {
      const row = positionsOutput[i];
      const col = positionsOutput[i+1];
      sudokuSession.pencil(digitsOutput, row, col);
    }

    await sudokuSession.message.delete();
    const reply = await sudokuSession.generateReply(message);

    await interaction.editReply(reply);
  }
}
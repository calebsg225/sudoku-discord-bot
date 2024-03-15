// highlight or unhighlight a sudoku number

import { SlashCommandBuilder } from "discord.js";
import SlashCommand from "../../_interface/SlashCommand";

export const hl: SlashCommand = {
  path: 'sudoku/mechanics',
  data: new SlashCommandBuilder()
    .setName('hl')
    .setDescription('highlight or unhighlight a digit')
    .setDMPermission(false)
    .addNumberOption(option =>
      option.setName('digit')
        .setDescription('digit to highlight')
        .setMinValue(1)
        .setMaxValue(9)
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

    await interaction.deferReply();
    const message = await interaction.fetchReply();

    const sudokuSession = interaction.client.sudokuSessions.get(user.id);

    const digit = interaction.options.getNumber('digit', true);

    await sudokuSession.highlightDigit(digit);

    await sudokuSession.message.delete();
    const reply = await sudokuSession.generateReply(message);

    await interaction.editReply(reply);
  }
}
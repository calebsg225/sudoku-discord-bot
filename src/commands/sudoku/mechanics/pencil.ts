// make pencil marks on a certain square

import { SlashCommandBuilder } from "discord.js";
import SlashCommand from "../../_interface/SlashCommand";

export const pencil: SlashCommand = {
  path: 'sudoku/mechanics',
  data: new SlashCommandBuilder()
    .setName('pencil')
    .setDescription('add or remove a pencil marking in a specefied square')
    .setDMPermission(false)
    .addNumberOption(option =>
      option.setName('position')
        .setDescription('[digit, row, column], Ex. 763 would be digit 7, row 6, column 3')
        // does not deal with zeros being entered
        // further verification is required in execute funtion
        .setMinValue(111)
        .setMaxValue(999)
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

    const sudokuSesion = interaction.client.sudokuSessions.get(user.id);

    const positions = interaction.options.getNumber('position', true).toString().split('');
    const { verified, output } = sudokuSesion.verifyInput(positions);
    
    // verify user has inputed valid data
    if (!verified) {
      return interaction.reply({
        content: 'The position data you have entered is invalid. Please try again.',
        ephemeral: true
      });
    }

    await interaction.deferReply();
    const message = await interaction.fetchReply();

    const [ digit, row, column ] = output;

    // pencil data here

    await interaction.editReply(`${digit}|${row}|${column}`);


  }
}
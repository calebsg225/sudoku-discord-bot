// make pencil marks on a certain square

import { SlashCommandBuilder } from "discord.js";
import SlashCommand from "../../_interface/SlashCommand";

export const pencil: SlashCommand = {
  path: 'sudoku/mechanics',
  data: new SlashCommandBuilder()
    .setName('pencil')
    .setDescription('place or clear pencil markings')
    .setDMPermission(false)
    .addSubcommand(subCommand =>
      subCommand.setName('clear')
        .setDescription('clear selected square of all pencil markings')
        .addNumberOption(option =>
          option.setName('position')
            .setDescription('[row, column], Ex. 29 would be row 2, column 9')
            .setMinValue(11)
            .setMaxValue(99)
            .setRequired(true)
        )
    ).addSubcommand(subCommand =>
      subCommand.setName('place')
        .setDescription('add or remove a pencil marking in a specefied square')
        .addNumberOption(option =>
          option.setName('position')
            .setDescription('[digit, row, column], Ex. 763 would be digit 7, row 6, column 3')
            .setMinValue(111)
            .setMaxValue(999)
            .setRequired(true)
        )
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

    const positions = interaction.options.getNumber('position', true).toString().split('');
    const { verified, output } = sudokuSession.verifyInput(positions);
    
    // verify user has inputed valid data
    if (!verified) {
      return interaction.reply({
        content: 'The position data you have entered is invalid. Please try again.',
        ephemeral: true
      });
    }

    await interaction.deferReply();
    const message = await interaction.fetchReply();

    const subCommand = interaction.options.getSubcommand();

    if (subCommand === 'place') {
      // 'place' sub command
      const [ digit, row, column ] = output;
      sudokuSession.pencilPlace(digit, row, column);
    } else {
      // 'clear' sub command
      const [ row, column ] = output;
      sudokuSession.pencilClear(row, column);
    }

    await sudokuSession.message.delete();
    const reply = await sudokuSession.generateReply(message);

    await interaction.editReply(reply);
  }
}
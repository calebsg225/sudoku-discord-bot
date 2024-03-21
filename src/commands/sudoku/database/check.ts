// check your solution

import { SlashCommandBuilder } from "discord.js";
import SlashCommand from "../../_interface/SlashCommand";

export const check: SlashCommand = {
  path: 'sudoku/mechanics',
  data: new SlashCommandBuilder()
    .setName('check')
    .setDescription('Check your solution.')
    .setDMPermission(false)
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

    await interaction.deferReply();
    const message = await interaction.fetchReply();

    // check solution here
    const { solved, completedReply, difficulty } = await sudokuSession.checkSudoku();
    
    // do nothing but send a message if solution is incorrect
    if (!solved) {
      return interaction.editReply(`Your solution is incorrect.`)
    }

    await sudokuSession.message.delete();
    
    // completed game attachment with attached message
    await interaction.channel.send(completedReply);

    await interaction.channel.send(`Here is another \`${difficulty}\` sudoku:`);

    const reply = await sudokuSession.generateReply(message);

    // no very clean way to do this but it works
    await interaction.channel.send(reply).then(msg => {
      sudokuSession.message = msg;
    });
    
  }
}
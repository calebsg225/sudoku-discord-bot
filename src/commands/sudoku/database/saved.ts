// view saved games and optionally load them

import { SlashCommandBuilder} from "discord.js";
import SlashCommand from "../../_interface/SlashCommand";

export const saved: SlashCommand = {
  path: 'sudoku/database',
  data: new SlashCommandBuilder()
    .setName('saved')
    .setDescription('view, load, and delete saved games')
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

    await interaction.deferReply();
    const message = await interaction.fetchReply();

    const sudokuSession = interaction.client.sudokuSessions.get(user.id);

    await sudokuSession.message.delete();

    const reply = await sudokuSession.view(message, "Saved");
    

    // @[user]'s Saved Games
    // difficulty: [difficulty]
    // [image of game]
    // game 1 out of ??                       <-- should i do this?

    // buttons: [left] [right] [load] [delete] [exit]

    // this message will be updated instead of replaced every time a button is pressed.

    await interaction.editReply(reply);
  }
}
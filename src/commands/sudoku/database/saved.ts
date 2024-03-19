// view saved games and optionally load them

import { ButtonInteraction, ChatInputCommandInteraction, ComponentType, SlashCommandBuilder} from "discord.js";
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
    
    const sudokuSession = interaction.client.sudokuSessions.get(user.id);
    
    // verify user is not already viewing games
    if (sudokuSession.viewing) {
      return interaction.reply({
        content: "You are already viewing your games.\nPress exit to stop viewing your games.",
        ephemeral: true
      });
    }
    
    await interaction.deferReply();
    const message = await interaction.fetchReply();
    
    await sudokuSession.message.delete();

    const reply = await sudokuSession.view(message, "Saved");
    
    const response = await interaction.editReply(reply);

    const collectionFilter = (i: ButtonInteraction) => {return i.user.id === interaction.user.id};

    const collector = response.createMessageComponentCollector({
      filter: collectionFilter,
      componentType: ComponentType.Button,
      time: 3_600_000
    });

    // listen for button presses in view menu
    collector.on('collect', async i => {
      switch (i.customId) {
        case ("left"):
          await i.update(await sudokuSession.shiftGame("Saved", "left"));
          break;
        case ("right"):
          await i.update(await sudokuSession.shiftGame("Saved", "right"));
          break;
        case ("load"):
          break;
        case ("delete"):
          break;
        case ("exit"):
          await i.deferReply();
          const mes = await i.fetchReply();
          await sudokuSession.message.delete();
          const reply = await sudokuSession.exitViewingMode(mes);
          await i.editReply(reply);
          break;
      }
    });

    // @[user]'s Saved Games
    // difficulty: [difficulty]
    // [image of game]
    // game 1 out of ??                       <-- should i do this? yes

    // buttons: [left] [right] [load] [delete] [exit]

    // this message will be updated instead of replaced every time a button is pressed.

  }
}
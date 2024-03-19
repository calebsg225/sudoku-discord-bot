// move both [saved] and [completed] commands here
// view saved games and optionally load them

import { ButtonInteraction, ComponentType, SlashCommandBuilder} from "discord.js";
import SlashCommand from "../../_interface/SlashCommand";
import { viewChoices } from "../../../model/sudoku/choices";

export const view: SlashCommand = {
  path: 'sudoku/database',
  data: new SlashCommandBuilder()
    .setName('view')
    .setDescription('View, load, and delete saved games. View completed games.')
    .setDMPermission(false)
    .addStringOption(option =>
      option.setName('type')
        .setDescription('select to view saved or completed games')
        .setChoices(...viewChoices)
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
    
    // verify user is not already viewing games
    if (sudokuSession.viewing) {
      return interaction.reply({
        content: "You are already in view mode.\nPress `Exit` to stop viewing your games.",
        ephemeral: true
      });
    }
    
    await interaction.deferReply();
    const message = await interaction.fetchReply();

    const viewType = interaction.options.getString('type', true);

    // converting to make typescript happy...
    const newViewType: "Saved" | "Completed" = viewType === "Completed" ? "Completed" : "Saved";
    
    await sudokuSession.message.delete();

    const reply = await sudokuSession.view(message, newViewType);
    
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
          await i.update(await sudokuSession.shiftGame(newViewType, "left"));
          break;
        case ("right"):
          await i.update(await sudokuSession.shiftGame(newViewType, "right"));
          break;
        case ("load"):
          await i.deferReply();
          await sudokuSession.message.delete();
          const loadReply = await sudokuSession.loadSavedGame(await i.fetchReply());
          await i.editReply(loadReply);
          break;
        case ("delete"):
          break;
        case ("exit"):
          await i.deferReply();
          await sudokuSession.message.delete();
          const exitReply = await sudokuSession.exitViewingMode(await i.fetchReply());
          await i.editReply(exitReply);
          break;
      }
    });

  }
}
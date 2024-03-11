// handle user bot interactions

import { ChatInputCommandInteraction, Events, Interaction } from "discord.js";
import chalk from "chalk";
import { Listener } from "../_interface/Listener";

export const interactionCreate: Listener = {
  name: Events.InteractionCreate,
  execute: async (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
      await handleSlashCommands(interaction);
    }
  }
}

const handleSlashCommands = async (interaction: ChatInputCommandInteraction) => {
  const command = interaction.client.commands.get(interaction.commandName);
  
  if (!command) {
    const message = `The command \`${interaction.commandName}\` does not exist.`;
    console.log(chalk.blueBright(message));
    interaction.reply({
      content: message,
      ephemeral: true
    });
  }

  try {
    command.execute(interaction);
  } catch (err) {
    console.error(chalk.red(err));
    const reply = {
      content: `There was an issue running the command \`${command.name}\`.`,
      ephemeral: true
    }
    if (interaction.deferred || interaction.replied) {
      interaction.followUp(reply);
    } else {
      interaction.reply(reply);
    }
  }
}
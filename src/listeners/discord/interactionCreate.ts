// handle user bot interactions

import { ChatInputCommandInteraction, Events, Interaction, Collection } from "discord.js";
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

  const { cooldowns } = interaction.client;
  const cmdName = command.data.name;
  const user = interaction.user;

  // creates collection of user cooldowns for specific command if it does not exist
  if (!cooldowns.has(cmdName)) {
    cooldowns.set(cmdName, new Collection());
  }

  const now = Date.now();

  // collection of users with an active cooldown
  const timestamps = cooldowns.get(cmdName);
  const defaultCooldownSeconds = 1;

  // set cooldown amount
  const cooldownAmount = (command.cooldown ?? defaultCooldownSeconds) * 1000;

  if (timestamps.has(user.id)) {
    const expirationTime = timestamps.get(user.id) + cooldownAmount;
    return interaction.reply({
      content: `You're too fast, I can't keep up! Please wait <t:${Math.round(expirationTime / 1000)}:R>`,
      ephemeral: true
    }).then(msg => {
      setTimeout(() => msg.delete(), expirationTime - now);
    });
  }

  timestamps.set(user.id, now);
  setTimeout(() => timestamps.delete(user.id), cooldownAmount);

  try {
    command.execute(interaction);
  } catch (err) {
    console.error(chalk.red(err));
    const reply = {
      content: `There was an issue running the command \`${cmdName}\`.`,
      ephemeral: true
    }
    if (interaction.deferred || interaction.replied) {
      interaction.followUp(reply);
    } else {
      interaction.reply(reply);
    }
  }
}
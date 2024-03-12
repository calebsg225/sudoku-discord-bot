// reload a slash command through discord without restarting bot

import { ChatInputCommandInteraction, SlashCommandBuilder, escapeHeading } from "discord.js";
import SlashCommand from "../_interface/SlashCommand";
import { DevUserId } from "../../../config.json";
import chalk from "chalk";

export const reload: SlashCommand = {
  path: `utils`,
  data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('[dev only] reload a slash command')
    .addStringOption(option => 
      option.setName('command')
        .setDescription('command to reload')
        .setRequired(true)
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    if (interaction.user.id !== DevUserId) {
      return interaction.reply({
        content: `This command is for dev use only.`,
        ephemeral: true
      });
    }

    const commandName = interaction.options.getString('command', true);
    const command = interaction.client.commands.get(commandName);

    // filters out invalid commands
    if (!command) {
      return interaction.reply({
        content: `No command exists with the name \`${commandName}\`.`,
        ephemeral: true
      });
    }

    await interaction.deferReply({ephemeral: true});

    console.log(chalk.gray(`[Reload Status] Reloading \`${command.data.name}\` command...`));
    const path = `../${command.path}/${command.data.name}.ts`;

    // clear cache associated with command to be reloaded
    delete require.cache[require.resolve(path)];

    // attempt to reload command
    try {
      interaction.client.commands.delete(command.data.name);
      await import(path).then(newCommand => {
        interaction.client.commands.set(command.data.name, newCommand[command.data.name]);
      });
      console.log(chalk.white(`[Reload Status] Reloaded \`${command.data.name}\` command.`));
      return interaction.editReply(`Command \`${command.data.name}\` reloaded successfully.`);
    } catch (error) {
      console.error(chalk.red(error));
      return interaction.editReply(`Command \`${command.data.name}\` could not be reloaded.`)
    }

  }
}
// deploy commands to discord bot server(s)

import { REST, RESTPostAPIApplicationGuildCommandsJSONBody, Routes } from "discord.js";
import chalk from "chalk";
import { BotToken, ClientId, DevGuildIds } from "../../config.json";
import commands, { excludeCommands } from "../commands/commands";

export default (global: boolean) => {
  const commandData: RESTPostAPIApplicationGuildCommandsJSONBody[] = [];

  // load commands to deploy
  commands.forEach((v, k) => {
    if (global && excludeCommands.has(v)) return;
    commandData.push(v.data.toJSON());
  });

  const rest = new REST().setToken(BotToken);

  (async () => {
    // attempts to deploy loaded commands to discord
    try {
      console.log(chalk.gray(`[Deployment Status] Deploying ${commandData.length} of ${commands.size} commands...`));
      if (global) {
        await rest.put(
          Routes.applicationCommands(ClientId),
          { body: commandData }
        );
      }
      else {
        for (const guildId of DevGuildIds) {
          await rest.put(
              Routes.applicationGuildCommands(ClientId, guildId),
            { body: commandData }
          );
        }
      }
      console.log(chalk.white(`[Deployment Status] Deployed. ${commandData.length} of ${commands.size} commands.`));
    } catch (error) {
      console.error(chalk.red(error));
    }
  })();
}
// deploy commands to discord bot server(s)

import { REST, RESTPostAPIApplicationGuildCommandsJSONBody, Routes } from "discord.js";
import chalk from "chalk";
import { BotToken, ClientId, DevGuildId } from "../../config.json";
import { globalCommands, devCommands } from "../commands/commands";

export default (global: boolean) => {
  const globalCommandsData: RESTPostAPIApplicationGuildCommandsJSONBody[] = [];
  const devCommandsData: RESTPostAPIApplicationGuildCommandsJSONBody[] = [];

  // load commands to deploy
  globalCommands.forEach((v, k) => {
    console.log(chalk.cyan(`Loading the \`${k}\` global command...`))
    globalCommandsData.push(v.data.toJSON());
  });
  
  devCommands.forEach((v, k) => {
    console.log(chalk.cyan(`Loading the \`${k}\` dev command...`))
    globalCommandsData.push(v.data.toJSON());  
  });

  const rest = new REST().setToken(BotToken);

  (async () => {
    // attempts to deploy loaded commands to discord
    try {
      console.log(chalk.gray(`[Deployment Status] Deploying commands...`));
      if (global) {
        await rest.put(
          Routes.applicationCommands(ClientId),
            { body: globalCommandsData }
        );
      }
      else {
        await rest.put(
          Routes.applicationCommands(ClientId),
          { body: [] }
        )
        await rest.put(
          Routes.applicationGuildCommands(ClientId, DevGuildId),
            { body: [...devCommandsData, ...globalCommandsData] }
        );
      }
      console.log(chalk.white(`[Deployment Status] Deployed commands.`));
    } catch (error) {
      console.error(chalk.red(error));
    }
  })();
}
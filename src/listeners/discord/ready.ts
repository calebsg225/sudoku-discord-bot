import { Client, Events } from "discord.js";
import chalk from "chalk";
import { Listener } from "../_interface/Listener";

export const ready: Listener = {
  name: Events.ClientReady,
  once: true,
  execute: async (client: Client) => {
    console.log(chalk.green(`Logged in as ${client.user.tag}...`));
  }
}
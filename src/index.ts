import { Client, GatewayIntentBits } from "discord.js";
import chalk from "chalk";
import { BotToken } from "../config.json";

import listeners from "./listeners/listeners";

import mongoose from "mongoose";
const { connection } = mongoose;

console.log(chalk.yellow(`Bot is starting...`));

const client = new Client({intents: [GatewayIntentBits.Guilds]});

// set online status to mobile
const {DefaultWebSocketManagerOptions} = require(`@discordjs/ws`);
DefaultWebSocketManagerOptions.identifyProperties.browser = "Discord Android";

// mount commands to client

// activate event listeners
listeners(client, connection);

client.login(BotToken);
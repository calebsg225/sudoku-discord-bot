import { Client } from "discord.js";
import mongoose from "mongoose";

// mongo events
import mongoEvents from "./mongo/ConnectionEvents";

// discord events
import { ready } from "./discord/ready";
import { interactionCreate } from "./discord/interactionCreate";

const discordEvents = [
  ready, interactionCreate
];

// run all event listeners
export default (client: Client, connection: mongoose.Connection) => {
  // discord events
  for (const event of discordEvents) {
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }
  
  // mongo events
  for (const event of mongoEvents) {
    if (event.once) {
      connection.once(event.name, (...args) => event.execute(...args));
    } else {
      connection.on(event.name, (...args) => event.execute(...args));
    }
  }
}
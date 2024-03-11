import { Client } from "discord.js";
import mongoose from "mongoose";

// discord events
import { ready } from "./discord/ready";

// mongo events
import mongoEvents from "./mongo/ConnectionEvents";

const discordEvents = [ready];

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
import { Client } from "discord.js";
import mongoose from "mongoose";

// discord events
import { ready } from "./discord/ready";

// mongo events

const events = [ready];

export default (client: Client, connection: mongoose.Connection) => {
  // run all event listeners
  for (const event of events) {
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }
}
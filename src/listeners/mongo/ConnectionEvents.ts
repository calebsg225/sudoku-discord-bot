import chalk from "chalk";
import { Listener } from "../_interface/Listener";

const mongoEvents: Listener[] = [
  {
    name: 'connecting',
    execute: async () => {
      console.log(chalk.cyan(`[Database Status] Connecting...`));
    }
  },
  {
    name: 'connected',
    execute: async () => {
      console.log(chalk.greenBright(`[Database Status] Connected.`));
    }
  },
  {
    name: 'disconnected',
    execute: async () => {
      console.log(chalk.redBright(`[Database Status] Disconnected.`));
    }
  },
  {
    name: 'err',
    execute: async (error: Error) => {
      console.log(chalk.red(`An error has occured with the databse connection. \n${error}`));
    }
  }
];

export default mongoEvents;
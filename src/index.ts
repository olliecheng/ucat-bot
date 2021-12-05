// Require the necessary discord.js classes
import { Bot } from "./bot";

import {
  Client,
  Intents,
  Interaction,
  BaseCommandInteraction,
} from "discord.js";
// import type { Interaction } from "discord.js";

// configure environment params
require("dotenv").config();
// this adds an object to process.env (ROLE_IDS). it's illegal, but it works.
Object.assign(process, require("../config.json"));

const bot = new Bot(process.env.DISCORD_TOKEN as string);
bot.listen();

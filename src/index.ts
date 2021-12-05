// Require the necessary discord.js classes
import { Bot } from "./bot";

import {
  Client,
  Intents,
  Interaction,
  BaseCommandInteraction,
} from "discord.js";
// import type { Interaction } from "discord.js";

require("dotenv").config();

const bot = new Bot(process.env.DISCORD_TOKEN as string);
bot.listen();

import { Client, Interaction } from "discord.js";
import { Module, Command } from "../interfaces";

const pingCommand: Command = {
  name: "ping",
  description: "Replies with pong!",
  handler: async (client, interaction) => {
    await interaction.reply("Pong!");
  },
};

const pongCommand: Command = {
  name: "pong",
  description: "not the video game",
  handler: async (client, interaction) => {
    await interaction.reply("Ping...");
  },
};

const module: Module = {
  name: "ping-module",
  commands: [pingCommand, pongCommand],
};

export default module;

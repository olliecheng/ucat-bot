const { SlashCommandBuilder } = require("@discordjs/builders");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

import { loadModules } from "./modules";

// configure environment params
require("dotenv").config();
// @ts-ignore
global.config = require("../config.json");

(async () => {
  const modules = await loadModules();
  console.log(modules);

  let commands = Array.from(modules.commands)
    .filter(([name, command]) => !command.prevent_automatic_registration)
    .map(([name, command]) =>
      // DOESN'T SUPPORT OPTIONS
      new SlashCommandBuilder()
        .setName(name)
        .setDescription(command.description)
        .setDefaultPermission(
          command.default_permission || command.default_permission === undefined
        )
    )
    .map((command) => command.toJSON());

  const rest = new REST({ version: "9" }).setToken(process.env.DISCORD_TOKEN);
  console.log("Determined the commands:", commands);

  await rest.put(
    Routes.applicationGuildCommands(
      process.env.CLIENT_ID,
      // @ts-ignore
      global.config.SERVER_ID
    ),
    { body: commands }
  );
  console.log("Successfully registered application commands.");
})();

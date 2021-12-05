const { SlashCommandBuilder } = require("@discordjs/builders");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

// configure environment params
require("dotenv").config();
Object.assign(process.env, require("../config.json"))

import { loadModules } from "./modules";

(async () => {
  const modules = await loadModules();
  console.log(modules);

  let commands = Array.from(modules.commands)
    .map(([name, command]) =>
      new SlashCommandBuilder()
        .setName(name)
        .setDescription(command.description)
    )
    .map((command) => command.toJSON());



  const rest = new REST({ version: "9" }).setToken(process.env.DISCORD_TOKEN);
  console.log("Determined the commands:", commands)

  await rest.put(
    Routes.applicationGuildCommands(
      process.env.CLIENT_ID,
      process.env.UCAT_SERVER_ID
    ),
    { body: commands }
  );
  console.log("Successfully registered application commands.");
})();

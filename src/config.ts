const config = require("../config.json");
import { BaseCommandInteraction, Client, GuildManager } from "discord.js";

interface ConfigOptions {
  MODERATOR_ROLE_IDS: string[];
  ADMIN_ROLE_ID: string;
  ROLE_IDS: Map<string, string[]>;
  SPAM_CHANNEL_ID: string;
  ROLES: Map<string, string>;
}

export function loadConfig(
  obj?: BaseCommandInteraction | string
): ConfigOptions {
  let id: string;
  if (typeof obj === "string") {
    id = obj;
  } else id = obj?.guildId || "default";

  return config[id];
}

export function getServers(): string[] {
  if (process.env.TEST_SERVER) {
    return [process.env.TEST_SERVER];
  }
  let servers = [
    ...Object.keys(config).filter((x) => !["default", "extra"].includes(x)),
    config.extra,
  ];
  console.log("Loaded servers:", servers);
  return servers;
}

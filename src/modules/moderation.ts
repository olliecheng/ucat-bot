import {
  Client,
  Interaction,
  MessageActionRow,
  MessageSelectMenu,
  Message,
  MessageComponentInteraction,
  SelectMenuInteraction,
  MessageButton,
  GuildInviteManager,
  GuildMember,
  Permissions,
  TextChannel,
} from "discord.js";
import { Module, Command, Event } from "../interfaces";
import emojiRegex from "emoji-regex";
import { loadConfig } from "../config";

const checkForWords: Event = {
  name: "messageSentEvent",
  eventType: "messageCreate",
  handler: async (client: any, msg: Message) => {
    const harassment = ["cunt", "hoe", "rape", "bitch"];
    console.log("client");

    for (let word in harassment) {
      if (msg.content.includes(word)) {
        await client.channels.get("1014766065181536287").send({
          content: "",
          embeds: [
            {
              type: "rich",
              title: `Warning`,
              description: "",
              color: 0xff0000,
              fields: [
                {
                  name: `Message contents`,
                  value: msg.content,
                  inline: true,
                },
                {
                  name: `Message author`,
                  value: `<@!${msg.author.id}>`,
                },
                {
                  name: "\u200B",
                  value: `_[Navigate to message](${msg.url})_`,
                },
              ],
            },
          ],
        });
        return;
      }
    }
  },
};

const module: Module = {
  name: "moderation",
  events: [checkForWords],
};

export default module;

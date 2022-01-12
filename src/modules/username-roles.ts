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
  TextChannel,
} from "discord.js";
import { Module, Command, Event } from "../interfaces";
import emojiRegex from "emoji-regex";

import SparkMD5 from "spark-md5";

enum Region {
  UK = "UK",
  ANZ = "ANZ",
}

const memberUpdatedEvent: Event = {
  name: "member-updated-event",
  eventType: "guildMemberUpdate",
  handler: async (
    client: any,
    oldMember: GuildMember,
    newMember: GuildMember
  ) => {
    let oldNickname = oldMember.nickname || oldMember.user.username;
    let unsanitisedNickname = newMember.nickname || newMember.user.username;
    console.log(`${oldNickname} → ${unsanitisedNickname}`);

    let sanitisedNickname = unsanitisedNickname
      .replaceAll(emojiRegex(), "-")
      .substring(0, 32); // just in case? sanity check ig

    // check if user has tutor role
    let nameChanged = false;
    // @ts-ignore
    for (let [role, emojiUntyped] of Object.entries(global.config.ROLES)) {
      let emoji = emojiUntyped as string;
      if (newMember.roles.cache.some((r) => r.id == role)) {
        // will not fire for admins who have a higher role
        nameChanged = true;

        if (newMember.nickname?.includes(emoji)) {
          continue;
        }

        let newNickname =
          (newMember.nickname || newMember.user.username) + " " + emoji;
        try {
          await newMember.setNickname(newNickname);
        } catch (error) {
          console.log(`Could not set tutor emoji ${error}`);
        }
      }
    }

    if (nameChanged) return;

    if (sanitisedNickname !== unsanitisedNickname) {
      // message user
      let errMsg =
        `I noticed that you changed your username from \`${oldNickname}\` to \`${unsanitisedNickname}\`. ` +
        `However, emojis aren't allowed in user nicknames... ` +
        `Please change your username.`;

      try {
        // first send DM
        await newMember.send("Hi! " + errMsg);
      } catch {
        // if DMs are closed
        let logChannel = (await newMember.guild.channels.fetch(
          // @ts-ignore
          global.config.SPAM_CHANNEL_ID
        )) as TextChannel;

        logChannel.send(`Hi <@${newMember.id}>, ` + errMsg);
      }

      try {
        await newMember.setNickname(sanitisedNickname);
      } catch (error) {
        console.log(`Error changing nickname: ${error}`);
      }
    }
  },
};

const module: Module = {
  name: "username-role-suffixes",
  events: [memberUpdatedEvent],
};

export default module;

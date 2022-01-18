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

import SparkMD5 from "spark-md5";
import { MembershipScreeningFieldType } from "discord-api-types";

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
    if (newMember.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
      console.log("Role edit for administrator: ignore");
      return;
    }
    let oldNickname = oldMember.nickname || oldMember.user.username;
    let unsanitisedNickname = newMember.nickname || newMember.user.username;
    console.log(`${oldNickname} → ${unsanitisedNickname}`);

    let sanitisedNickname = unsanitisedNickname
      .replaceAll(emojiRegex(), "-")
      .substring(0, 32); // just in case? sanity check ig

    // check if user has tutor role
    let nameChanged = false;
    for (let [role, emojiUntyped] of Object.entries(
      loadConfig(newMember.guild.id).ROLES
    )) {
      let emoji = emojiUntyped as string;
      if (newMember.roles.cache.some((r) => r.id == role)) {
        nameChanged = true;

        if (newMember.nickname?.includes(emoji)) {
          continue;
        }

        let newNickname =
          (newMember.nickname || newMember.user.username) + " " + emoji;
        console.log("setting new nickname to", newNickname);
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

      const originalDescription =
        " I noticed that you recently changed your nickname to contain an emoji. However, emojis are reserved for tutor and professional roles.\n\nIn the meantime, I've replaced your nickname with a sanitised version; please change it to a non-emoji nickname when you have a chance. Thank you!";
      let embed = {
        type: "rich",
        title: `Nickname change issue (r/UCAT Discord server)`,
        description: "",
        color: 0xa81335,
        fields: [
          {
            name: `Original nickname`,
            value: `\`${oldNickname}\``,
            inline: true,
          },
          {
            name: `New (invalid) nickname`,
            value: `\`${unsanitisedNickname}\``,
            inline: true,
          },
          {
            name: `Your current (sanitised) nickname`,
            value: `\`${sanitisedNickname}\``,
          },
        ],
        footer: {
          text: `r/UCAT Discord\nThink this is a mistake? Please get in touch with a mod!`,
          icon_url: `https://cdn.discordapp.com/icons/726025878236299356/1af67bb930a71207375b269f069d4ea2.webp?size=240`,
        },
      };

      try {
        // first send DM
        embed.description = "Hi!" + originalDescription;
        await newMember.send({ embeds: [embed] });
      } catch {
        // if DMs are closed
        let logChannel = (await newMember.guild.channels.fetch(
          loadConfig(newMember.guild.id).SPAM_CHANNEL_ID
        )) as TextChannel;

        embed.description = `Hi <@${newMember.id}>!` + originalDescription;
        await logChannel.send({ embeds: [embed] });
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

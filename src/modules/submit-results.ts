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
} from "discord.js";
import { Module, Command, Event } from "../interfaces";
import { loadConfig } from "../config";

import SparkMD5 from "spark-md5";

enum Region {
  UK = "UK",
  ANZ = "ANZ",
}

function generatePrefilledLink(user_id: string, region?: Region) {
  // https://docs.google.com/forms/d/e/1FAIpQLSdIZOR746q0qHXBj9ucPARcoq_rAiUWCCD0pKkfw7HBY_4F5g/
  //    viewform?usp=pp_url&entry.475796844=ABC&entry.2013655943=UK
  // https://docs.google.com/forms/d/e/1FAIpQLSfl9E1i0pCXuwmCGdsvBMoPNo4ReO7pfR1ne4DANctZzCSlWQ/viewform?
  //  usp=pp_url&entry.888682353=123213213213&entry.1725074781=ANZ

  return (
    "https://docs.google.com/forms/d/e/1FAIpQLSfl9E1i0pCXuwmCGdsvBMoPNo4ReO7pfR1ne4DANctZzCSlWQ/" +
    `viewform?usp=pp_url&entry.888682353=${user_id}` +
    (region ? `&entry.1725074781=${region}` : "")
  );
}

const submitMockResults: Command = {
  name: "mocks",
  description: "Submit or view mock results.",

  handler: async (client, interaction) => {
    const row = new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setCustomId("submit-provider")
        .setPlaceholder("Choose a provider...")
        .addOptions(
          ["Medify", "Medentry", "Official Mocks"].map((x) => {
            return { label: x, value: x };
          })
        )
    );

    await interaction.reply({
      content: "**Submitting mock exam results...**",
      components: [row],
    });
  },
};

const interactionChangedEvent: Event = {
  name: "submission-interaction-event",
  eventType: "interactionCreate",
  handler: async (client: any, genericInteraction: Interaction) => {
    // type guard
    if (!genericInteraction.isMessageComponent()) {
      return;
    }

    if (!genericInteraction.customId.startsWith("submit")) {
      // not a submission interaction event
      return;
    }

    const { id, roles: rolesManager } =
      genericInteraction.member as GuildMember;
    // base64 encode of the MD5 hash of the Discord username
    const userID = Buffer.from(
      SparkMD5.hash(id.toString() + process.env.ID_SUFFIX)
    ).toString("base64");

    // get user country from roles
    const roles = Array.from(rolesManager.cache);
    const roleIDs = roles.map((x) => x[0].toString());

    let region: Region | undefined = undefined;
    const ROLE_IDS = loadConfig().ROLE_IDS;

    if (
      rolesManager.cache.find((r) => {
        // @ts-ignore
        return ROLE_IDS.UK.includes(r.id);
      })
    ) {
      region = Region.UK;
    }
    if (
      rolesManager.cache.find((r) => {
        // @ts-ignore
        return ROLE_IDS.ANZ.includes(r.id);
      })
    ) {
      region = Region.ANZ;
    }

    const interaction = genericInteraction as SelectMenuInteraction;
    const provider: string = interaction.values[0];

    if (provider == "Medify") {
      const selectRow = new MessageActionRow().addComponents(
        new MessageSelectMenu()
          .setCustomId("submit-provider")
          .setPlaceholder("Choose a provider...")
          // .addOptions(
          //   ["Medify", "Medentry", "Official Mocks"].map((x) => {
          //     return { label: x, value: x, default: provider == x };
          //   })
          // )
          .setDisabled(true)
          .addOptions([{ label: provider, value: provider, default: true }])
      );

      const URLRow = new MessageActionRow().addComponents(
        new MessageButton()
          .setURL(generatePrefilledLink(userID, region))
          .setStyle("LINK")
          .setLabel(`Link to submit ${provider} results`)
          .setEmoji("📎")
      );

      const spreadsheetRow = new MessageActionRow().addComponents(
        new MessageButton()
          .setURL(
            "https://docs.google.com/spreadsheets/d/1j0P0tINr6mqvlL3qKQ6OJHYKPYLqwtNA50uNgSe8E6c/edit#gid=1109312239"
          )
          .setStyle("LINK")
          .setLabel(`Results spreadsheet`)
          .setEmoji("✏️")
      );

      await interaction.reply({
        content: "**Submitting mock exam results...**",
        components: [selectRow, URLRow, spreadsheetRow],
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "Only the spreadsheet for Medify is ready at the moment :(",
        ephemeral: true,
      });
    }
  },
};

const module: Module = {
  name: "submit-results",
  commands: [submitMockResults],
  events: [interactionChangedEvent],
};

export default module;

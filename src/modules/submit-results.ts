import {
  Client,
  Interaction,
  MessageActionRow,
  MessageSelectMenu,
  Message,
  MessageComponentInteraction,
  SelectMenuInteraction,
  MessageButton,
} from "discord.js";
import { Module, Command, Event } from "../interfaces";

import SparkMD5 from "spark-md5";

enum Region {
  UK = "UK",
  ANZ = "ANZ",
}

function generatePrefilledLink(user_id: string, region: Region) {
  // https://docs.google.com/forms/d/e/1FAIpQLSdIZOR746q0qHXBj9ucPARcoq_rAiUWCCD0pKkfw7HBY_4F5g/
  //    viewform?usp=pp_url&entry.475796844=ABC&entry.2013655943=UK

  return (
    "https://docs.google.com/forms/d/e/1FAIpQLSdIZOR746q0qHXBj9ucPARcoq_rAiUWCCD0pKkfw7HBY_4F5g/" +
    `viewform?usp=pp_url&entry.475796844=${user_id}&entry.2013655943=${region}`
  );
}

const submitMockResults: Command = {
  name: "submit-mock-results",
  description:
    "Submit your mock results to the database to gauge your performance.",

  handler: async (client, interaction) => {
    const row = new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setCustomId("provider")
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
      ephemeral: true,
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

    // base64 encode of the MD5 hash of the Discord username
    const userID = Buffer.from(
      SparkMD5.hash(genericInteraction.user.id)
    ).toString("base64");

    const interaction = genericInteraction as SelectMenuInteraction;
    const provider: string = interaction.values[0];

    const selectRow = new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setCustomId("provider")
        .setPlaceholder("Choose a provider...")
        .addOptions(
          ["Medify", "Medentry", "Official Mocks"].map((x) => {
            return { label: x, value: x, default: provider == x };
          })
        )
    );
    const URLRow = new MessageActionRow().addComponents(
      new MessageButton()
        .setURL(generatePrefilledLink(userID, Region.ANZ))
        .setStyle("LINK")
        .setLabel(`Link to submit ${provider} results`)
        .setEmoji("📎")
    );

    await interaction.update({
      content: "**Submitting mock exam results...**",
      components: [selectRow, URLRow],
    });
  },
};

const module: Module = {
  name: "submit-results",
  commands: [submitMockResults],
  events: [interactionChangedEvent],
};

export default module;

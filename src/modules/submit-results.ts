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
import { Module, Command, EventHandler } from "../interfaces";

import SparkMD5 from "spark-md5";

const submitMockResults: Command = {
  name: "submit-mock-results",
  description:
    "Submit your mock results to the database to gauge your performance.",

  handler: async (client, interaction) => {
    const userID = SparkMD5.hash(interaction.user.id);
    const row = new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setCustomId("provider")
        .setPlaceholder("Choose a provider...")
        .addOptions([
          { label: "Medify", value: "Medify" },
          { label: "Medentry", value: "Medentry" },
          { label: "Official Mocks", value: "Official Mocks" },
        ])
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
  handler: async (client, genericInteraction: Interaction) => {
    // type guard
    if (!genericInteraction.isMessageComponent()) {
      return;
    }

    const interaction = genericInteraction as SelectMenuInteraction;
    const provider: string = interaction.values[0];

    const selectRow = new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setDisabled(true)
        .setCustomId("disabled-provider")
        .setPlaceholder(provider)
        .addOptions([{ label: provider, value: provider }])
    );
    const URLRow = new MessageActionRow().addComponents(
      new MessageButton()
        .setURL("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
        .setStyle("LINK")
        .setLabel("Link to submit results")
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

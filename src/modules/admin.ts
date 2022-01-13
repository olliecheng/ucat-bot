import { Embed, SlashCommandStringOption } from "@discordjs/builders";
import { ApplicationCommandOptionType } from "discord-api-types";
import {
  ButtonInteraction,
  Client,
  Interaction,
  ApplicationCommand,
  MessageEmbed,
  ApplicationCommandOptionData,
  Role,
  MessageActionRow,
  MessageButton,
  MessageButtonStyle,
  GuildMember,
} from "discord.js";
import { create } from "domain";
import { Module, Command, Event } from "../interfaces";

const DefaultCurrentState = {
  title: "",
  description: "",
  multipleRoles: false,
  roles: [] as Array<[name: string, id: string, colour: MessageButtonStyle]>,
};
// @ts-ignore
let CurrentState: typeof DefaultCurrentState = {};
Object.assign(CurrentState, DefaultCurrentState);

const createRoleSelectorCommand: Command = {
  name: "role-picker",
  description: "Create the role picker selector message.",
  default_permission: false,
  prevent_automatic_registration: true,
  options: [
    {
      type: "STRING",
      name: "title",
      description: "Title of the created prompt",
      required: true,
    },
    {
      type: "STRING",
      name: "description",
      description: "Description of the created prompt",
      required: true,
    },
    {
      type: "BOOLEAN",
      name: "multirole",
      description: "Allow users to select multiple roles",
      required: true,
    },
  ],
  handler: async (client, interaction) => {
    let confirmEmbed = new MessageEmbed()
      .setTitle("Prompt creation started.")
      .setDescription("Use the `/admin add-role` command to add roles.");
    await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });
    CurrentState.title = interaction.options.get("title")?.value as string;
    CurrentState.description = interaction.options.get("description")
      ?.value as string;
    CurrentState.multipleRoles = interaction.options.get("multirole")
      ?.value as boolean;

    await updateAdminSlashCommand(client, [
      addRoleToSelectionCommand,
      cancelRoleSelectorCommand,
    ]);

    let promptChannel = interaction.channel;
    // promptChannel?.send({
    //   content:
    // })
  },
};

const cancelRoleSelectorCommand: Command = {
  name: "cancel",
  description: "Cancel role selector creation",
  default_permission: false,
  handler: async (client, interaction) => {
    await interaction.reply({
      content: "Cancelled. All your selections have been cleared.",
      ephemeral: true,
    });

    await updateAdminSlashCommand(client, [createRoleSelectorCommand]);

    // Reset state and all selected roles
    Object.assign(CurrentState, DefaultCurrentState);
  },
};

const addRoleToSelectionCommand: Command = {
  name: "add-role",
  description: "Add a role to the role selector",
  default_permission: false,
  options: [
    {
      type: "ROLE",
      name: "role",
      description: "Role to add",
      required: true,
    },
    {
      type: "STRING",
      name: "colour",
      description: "The colour of the role button. Defaults to grey.",
      required: false,
      choices: [
        {
          name: "green",
          value: "SUCCESS",
        },
        {
          name: "red",
          value: "DANGER",
        },
        {
          name: "grey",
          value: "SECONDARY",
        },
        {
          name: "blue",
          value: "PRIMARY",
        },
      ],
    },
  ],
  handler: async (client, interaction) => {
    // hello
    let roleID = interaction.options.get("role")?.value as string;
    let role = (await interaction.guild?.roles.fetch(roleID)) as Role;
    let colour = role.color;

    CurrentState.roles = [
      ...CurrentState.roles,
      [
        role.name,
        roleID,
        (interaction.options.get("colour")?.value as MessageButtonStyle) ||
          "SECONDARY",
      ],
    ];

    let roleAddedEmbed = new MessageEmbed()
      .setColor(colour)
      .setTitle(`Added role: ${role.name}`)
      .setDescription(
        "Current role choices:\n" +
          CurrentState.roles.map((x) => `• ${x[0]}`).join("\n")
      );
    interaction.reply({ embeds: [roleAddedEmbed], ephemeral: true });

    if (CurrentState.roles.length === 1) {
      await updateAdminSlashCommand(client, [
        addRoleToSelectionCommand,
        finaliseRoleSelectorCommand,
        addDividerCommand,
        cancelRoleSelectorCommand,
      ]);
    }
  },
};

const addDividerCommand: Command = {
  name: "add-divider",
  description: "Add a divider to the list of roles.",
  default_permission: false,
  handler: async (client, interaction) => {
    CurrentState.roles = [
      ...CurrentState.roles,
      ["---Divider---", "DIV", "LINK"],
    ];
    interaction.reply({ content: "Added divider.", ephemeral: true });
  },
};

const finaliseRoleSelectorCommand: Command = {
  name: "finish",
  description: "Finish the role selector creation",
  default_permission: false,
  handler: async (client, interaction) => {
    let confirmEmbed = new MessageEmbed().setTitle(
      "🎉 The prompt has been created."
    );
    await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });

    let chooseRoleEmbed = new MessageEmbed()
      .setTitle(CurrentState.title)
      .setDescription(CurrentState.description)
      .setFooter(
        "Click a button below to select a role. " +
          (CurrentState.multipleRoles
            ? "You can choose multiple roles."
            : "You can only select one role.") +
          " You can click again on a button to remove that role."
      )
      .setColor("BLURPLE");

    const prefix = CurrentState.multipleRoles ? "MULTI" : "SINGL";
    console.log("CurrentState", CurrentState);

    let componentsRow = [new MessageActionRow()];
    for (let role of CurrentState.roles) {
      if (role[1] === "DIV") {
        // divider, create a new row
        componentsRow = [...componentsRow, new MessageActionRow()];
        continue;
      } else if (componentsRow.at(-1)!.components?.length === 5) {
        // maximum ActionRow length reached
        componentsRow = [...componentsRow, new MessageActionRow()];
      }

      componentsRow.at(-1)!.addComponents(
        new MessageButton()
          .setCustomId(prefix + role[1])
          .setLabel(role[0])
          .setStyle(role[2])
      );
    }
    console.log("Components", componentsRow);
    await interaction.channel?.send({
      embeds: [chooseRoleEmbed],
      components: componentsRow,
    });

    await updateAdminSlashCommand(client, [createRoleSelectorCommand]);

    // Reset state and all selected roles
    Object.assign(CurrentState, DefaultCurrentState);
  },
};

//
//
// Interactions
//
//

const interactionClickedEvent: Event = {
  name: "role-button-clicked",
  eventType: "interactionCreate",
  handler: async (client: any, genericInteraction: Interaction) => {
    if (!genericInteraction.isButton()) return;
    let interaction = genericInteraction as ButtonInteraction;
    console.log(interaction);

    let customId = interaction.customId;
    let multipleRoles = customId.startsWith("MULTI");
    let roleId = customId.slice(5);

    let memberRoles = (interaction.member as GuildMember).roles;
    console.log("Keys", memberRoles.cache.keys());

    if (multipleRoles) {
      if (Array.from(memberRoles.cache.keys()).includes(roleId)) {
        await memberRoles.remove(roleId);
      } else {
        await memberRoles.add(roleId);
      }
    }
  },
};

async function updateAdminSlashCommand(
  client: Client,
  commands: Array<Command>
) {
  // @ts-ignore
  let guild = client.guilds.cache.get(global.config.SERVER_ID);

  let payload = {
    name: "admin",
    description: "Administrator only commands",
    defaultPermission: false,
    options: commands.map((commandHandler: Command) => {
      return {
        name: commandHandler.name,
        description: commandHandler.description,
        type: "SUB_COMMAND",
        // @ts-ignore
        options: commandHandler.options || [],
      } as ApplicationCommandOptionData;
    }),
  };

  let allCommands = await guild?.commands.fetch();
  let command = allCommands?.find((x) => x.name == "admin");
  if (command) {
    command = await guild?.commands.edit(command.id, payload);
  }
  command = await guild?.commands.create(payload);

  const permissions = [
    {
      // @ts-ignore
      id: global.config.MODERATOR_ROLE_ID,
      type: "ROLE",
      permission: true,
    },
  ];

  // @ts-ignore // why? wtf
  await command?.permissions.set({ permissions });
}

const initialiseAdminCommand: Event = {
  name: "create-role-picker-slash-command",
  eventType: "ready",
  handler: async (client: any) => {
    await updateAdminSlashCommand(client, [createRoleSelectorCommand]);
  },
};

const module: Module = {
  name: "admin-commands",
  commands: [
    createRoleSelectorCommand,
    cancelRoleSelectorCommand,
    addRoleToSelectionCommand,
    finaliseRoleSelectorCommand,
    addDividerCommand,
  ],
  events: [interactionClickedEvent, initialiseAdminCommand],
};

export default module;

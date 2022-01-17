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
  MessageActionRowComponent,
} from "discord.js";
import { create } from "domain";
import { Module, Command, Event } from "../interfaces";
import { loadConfig, getServers } from "../config";

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

    if (CurrentState.roles.some((x) => x[1] === roleID)) {
      // Role already exists - can't select again
      await interaction.reply({
        content: "Cannot select a role which has already been added!",
        ephemeral: true,
      });
      return;
    }

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
      )
      .setFooter("When you're done, type /admin finish");
    await interaction.reply({ embeds: [roleAddedEmbed], ephemeral: true });

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
    let customId = interaction.customId;

    if (!(customId.startsWith("MULTI") || customId.startsWith("SINGL"))) {
      // not interactions from this command
      return;
    }

    let multipleRoles = customId.startsWith("MULTI");
    let roleId = customId.slice(5);

    let guildRoles = interaction.guild!.roles;
    let roleName = (await guildRoles.fetch(roleId))?.name;

    let memberRoles = (interaction.member as GuildMember).roles;
    let memberRoleIDs = Array.from(memberRoles.cache.keys());
    console.log("Keys", memberRoles.cache.keys());

    if (multipleRoles) {
      if (memberRoleIDs.includes(roleId)) {
        console.log(roleId);
        await memberRoles.remove(roleId);
        await interaction.reply({
          content: `The role ${roleName} has been removed.`,
          ephemeral: true,
        });
      } else {
        console.log("RDSFSD", roleId);
        await memberRoles.add(roleId);
        await interaction.reply({
          content: `The role ${roleName} has been added.`,
          ephemeral: true,
        });
      }
    } else {
      let optionRoles = interaction.message
        .components!.map((row) => {
          return row.components.map(
            (component) =>
              (component as MessageActionRowComponent).customId!.slice(5) // .split(5) removes the MULTI- prefix
          );
        })
        .reduce((prev, curr) => [...prev, ...curr], []);

      // user wants to remove the role
      if (memberRoleIDs.includes(roleId)) {
        await memberRoles.remove(roleId);
        await interaction.reply({
          content: `Removed role ${roleName}.`,
          ephemeral: true,
        });
        return;
      }

      // there should only be one of these roles at a time but just in case...
      let rolesRemoved: string[] = [];
      for (let optionRole of optionRoles) {
        if (memberRoleIDs.includes(optionRole)) {
          rolesRemoved = [
            ...rolesRemoved,
            (await guildRoles.fetch(optionRole))!.name,
          ];
          await memberRoles.remove(optionRole);
        }
      }

      await memberRoles.add(roleId);

      let removedMessage: string;
      switch (rolesRemoved.length) {
        case 0: {
          removedMessage = "The";
          break;
        }
        case 1: {
          removedMessage = `The role ${rolesRemoved[0]} has been removed and the`;
          break;
        }
        default: {
          removedMessage = `The roles ${rolesRemoved.join(
            ", "
          )} have been removed and the`;
          break;
        }
      }

      await interaction.reply({
        content: `${removedMessage} role ${roleName} has been added.`,
        ephemeral: true,
      });
    }
  },
};

async function updateAdminSlashCommand(
  client: Client,
  commands: Array<Command>
) {
  for (let guildID of getServers()) {
    let guild = client.guilds.cache.get(guildID);

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

    const permissions = loadConfig(guildID).MODERATOR_ROLE_IDS.map((roleID) => {
      return {
        id: roleID,
        type: "ROLE",
        permission: true,
      };
    });
    // @ts-ignore // why? wtf
    await command?.permissions.set({ permissions });
  }
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

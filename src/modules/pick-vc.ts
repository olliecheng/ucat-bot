import { Client, Interaction, GuildMember, VoiceState } from "discord.js";
import { Module, Command } from "../interfaces";

const pickCommand: Command = {
  name: "pick-user",
  description: "Pick a random user from the VC channel that you're in.",
  handler: async (client, interaction) => {
    const member = interaction.member as GuildMember;
    const voiceState: VoiceState = member.voice;
    console.log(voiceState);

    const voiceChannel = voiceState.channel;

    // check if user is in a voice channel; if not, exit
    if (!voiceChannel) {
      await interaction.reply({
        content: "Join a voice channel to use this command.",
        ephemeral: true,
      });
      return;
    }

    const members = Array.from(voiceChannel.members);

    // get random item from `members`
    // array members is a list in format [id, GuildMember]
    const randomMember = members[Math.floor(Math.random() * members.length)][1];

    await interaction.reply(`Hey <@${randomMember.id}>, you're up!`);
  },
};

const module: Module = {
  name: "pick-vc",
  commands: [pickCommand],
};

export default module;

import {
  Client,
  Interaction,
  Modal,
  TextInputComponent,
  MessageActionRow,
  MessageButton,
  ModalSubmitInteraction,
} from "discord.js";
import { Module, Command, Event } from "../interfaces";

/* This code is shit - I'm sorry */
function calc(
  vr_raw: string,
  syll_raw: string,
  dmmcq_raw: string,
  qr_raw: string,
  ar_raw: string
): number {
  let [total, vr, qr, dm, ar, multi] = [0, 0, 0, 0, 0, 0];

  let [syll_correct, syll_partcorrect] = [
    ...syll_raw.split("\n"),
    "0",
    "0",
  ].map((x) => parseInt(x));

  var v = parseInt(vr_raw.trim());
  if (v <= 5) vr = 300;
  else if (v <= 7) vr = 330;
  else if (v <= 8) vr = 350;
  else if (v <= 10) vr = 370;
  else if (v <= 11) vr = 400;
  else if (v <= 12) vr = 430;
  else if (v <= 14) vr = 450;
  else if (v <= 15) vr = 470;
  else if (v <= 17) vr = 500;
  else if (v <= 18) vr = 530;
  else if (v <= 20) vr = 550;
  else if (v <= 22) vr = 570;
  else if (v <= 23) vr = 600;
  else if (v <= 25) vr = 630;
  else if (v <= 27) vr = 650;
  else if (v <= 29) vr = 670;
  else if (v <= 31) vr = 700;
  else if (v <= 32) vr = 730;
  else if (v <= 33) vr = 750;
  else if (v <= 34) vr = 770;
  else if (v <= 36) vr = 800;
  else if (v <= 38) vr = 830;
  else if (v <= 39) vr = 850;
  else if (v <= 41) vr = 870;
  else if (v <= 44) vr = 900;

  if (!v || v < 0 || v > 44) vr = 0;

  dm = 0;
  dm += syll_correct * 40;

  multi = parseInt(dmmcq_raw.trim());
  if (multi <= 2) dm += 300;
  else if (multi <= 4) dm += 310;
  else if (multi <= 5) dm += 320;
  else if (multi <= 6) dm += 330;
  else if (multi <= 7) dm += 340;
  else if (multi <= 8) dm += 350;
  else if (multi <= 9) dm += 360;
  else if (multi <= 10) dm += 370;
  else if (multi <= 11) dm += 400;
  else if (multi <= 12) dm += 420;
  else if (multi <= 13) dm += 450;
  else if (multi <= 14) dm += 470;
  else if (multi <= 15) dm += 500;
  else if (multi <= 16) dm += 510;
  else if (multi <= 17) dm += 520;
  else if (multi <= 18) dm += 530;
  else if (multi <= 20) dm += 540;

  if (syll_partcorrect == 0) dm += 0;
  else if (syll_partcorrect <= 1) dm += 30;
  else if (syll_partcorrect <= 2) dm += 70;
  else if (syll_partcorrect <= 3) dm += 110;
  else if (syll_partcorrect <= 4) dm += 150;
  else if (syll_partcorrect <= 5) dm += 180;
  else if (syll_partcorrect <= 6) dm += 210;
  else if (syll_partcorrect <= 7) dm += 240;
  else if (syll_partcorrect <= 8) dm += 270;
  else if (syll_partcorrect <= 9) dm += 300;

  if (isNaN(syll_correct) || isNaN(syll_partcorrect) || isNaN(multi)) dm = 0;

  v = parseInt(qr_raw.trim());

  if (v <= 3) qr = 300;
  else if (v <= 5) qr = 330;
  else if (v <= 7) qr = 350;
  else if (v <= 8) qr = 370;
  else if (v <= 9) qr = 400;
  else if (v <= 10) qr = 430;
  else if (v <= 11) qr = 450;
  else if (v <= 13) qr = 470;
  else if (v <= 15) qr = 500;
  else if (v <= 17) qr = 530;
  else if (v <= 19) qr = 550;
  else if (v <= 20) qr = 570;
  else if (v <= 21) qr = 600;
  else if (v <= 22) qr = 630;
  else if (v <= 23) qr = 650;
  else if (v <= 24) qr = 670;
  else if (v <= 25) qr = 700;
  else if (v <= 26) qr = 730;
  else if (v <= 27) qr = 750;
  else if (v <= 28) qr = 770;
  else if (v <= 29) qr = 800;
  else if (v <= 30) qr = 830;
  else if (v <= 32) qr = 850;
  else if (v <= 33) qr = 870;
  else if (v <= 36) qr = 900;

  if (!v || v < 0 || v > 36) qr = 0;

  v = parseInt(ar_raw.trim());
  if (v <= 5) ar = 300;
  else if (v <= 7) ar = 330;
  else if (v <= 9) ar = 350;
  else if (v <= 11) ar = 370;
  else if (v <= 13) ar = 400;
  else if (v <= 15) ar = 430;
  else if (v <= 17) ar = 450;
  else if (v <= 19) ar = 470;
  else if (v <= 21) ar = 500;
  else if (v <= 23) ar = 530;
  else if (v <= 25) ar = 550;
  else if (v <= 28) ar = 570;
  else if (v <= 30) ar = 600;
  else if (v <= 32) ar = 630;
  else if (v <= 34) ar = 650;
  else if (v <= 36) ar = 680;
  else if (v <= 38) ar = 720;
  else if (v <= 40) ar = 750;
  else if (v <= 42) ar = 770;
  else if (v <= 44) ar = 800;
  else if (v <= 46) ar = 830;
  else if (v <= 48) ar = 870;
  else if (v <= 50) ar = 900;

  if (!v || v < 0 || v > 50) ar = 0;

  return ar + qr + dm + vr;
}

const convertCommand: Command = {
  name: "convert",
  description: "Calculator to convert from raw marks to UCAT score",
  handler: async (client, interaction) => {
    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("convert-modal")
        .setLabel("Convert! 🧮")
        .setStyle("PRIMARY")
    );

    await interaction.reply({
      components: [row],
    });
  },
};

const interactionChangedEvent: Event = {
  name: "conversion-interaction-event",
  eventType: "interactionCreate",
  handler: async (client: any, genericInteraction: Interaction) => {
    // type guard
    if (
      genericInteraction.isModalSubmit() &&
      genericInteraction.customId === "conversion"
    ) {
      const interaction = genericInteraction as ModalSubmitInteraction;

      const VR = interaction.fields.getTextInputValue("VR");
      const DMsyl = interaction.fields.getTextInputValue("DMsyl");
      const DMmcq = interaction.fields.getTextInputValue("DMmcq");
      const QR = interaction.fields.getTextInputValue("QR");
      const AR = interaction.fields.getTextInputValue("AR");

      let [syll_correct, syll_partcorrect] = [
        ...DMsyl.split("\n"),
        "0",
        "0",
      ].map((x) => parseInt(x));

      await interaction.reply({
        content: `Your score is: \`${calc(
          VR,
          DMsyl,
          DMmcq,
          QR,
          AR
        )}\`, for the following results:

VR: ${VR}/44,
DM:
    ${syll_correct}/9 fully correct syllogisms
    ${syll_partcorrect}/9 partially correct syllogisms
    ${DMmcq}/20 multiple choice questions
QR: ${QR}/36
AR: ${AR}/50

_Consider using \`/mocks\` to record your results!_`,
        ephemeral: true,
      });
    } else if (
      genericInteraction.isMessageComponent() &&
      genericInteraction.customId === "convert-modal"
    ) {
      // Create the modal
      const modal = new Modal()
        .setCustomId("conversion")
        .setTitle("UCAT Score Converter");
      // Add components to modal
      // Create the text input components
      const VRscore = new TextInputComponent()
        .setCustomId("VR")
        .setLabel("Verbal Reasoning")
        .setStyle("SHORT")
        .setPlaceholder("/44...");
      const VRrow = new MessageActionRow().addComponents(VRscore);

      const DMSscore = new TextInputComponent()
        .setCustomId("DMsyl")
        .setLabel("Decision Making (syllogisms) - use two lines")
        .setStyle("PARAGRAPH")
        .setMaxLength(3)
        .setPlaceholder(
          "Line 1: # of fully correct\nLine 2: # of partially correct"
        );
      const DMSrow = new MessageActionRow().addComponents(DMSscore);

      const DMMscore = new TextInputComponent()
        .setCustomId("DMmcq")
        .setLabel("Decision Making (multiple choice)")
        .setStyle("SHORT")
        .setPlaceholder("/20...");
      const DMMrow = new MessageActionRow().addComponents(DMMscore);

      const QRscore = new TextInputComponent()
        .setCustomId("QR")
        .setLabel("Quantitative Reasoning")
        .setStyle("SHORT")
        .setPlaceholder("/36...");
      const QRrow = new MessageActionRow().addComponents(QRscore);

      const ARscore = new TextInputComponent()
        .setCustomId("AR")
        .setLabel("Abstract Reasoning")
        .setStyle("SHORT")
        .setPlaceholder("/50...");
      const ARrow = new MessageActionRow().addComponents(ARscore);

      // Add inputs to the modal
      modal.addComponents(VRrow, DMMrow, DMSrow, QRrow, ARrow);
      // Show the modal to the user
      await genericInteraction.showModal(modal);
    }
  },
};

const module: Module = {
  name: "convert-module",
  commands: [convertCommand],
  events: [interactionChangedEvent],
};

export default module;

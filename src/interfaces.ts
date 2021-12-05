import { Message, Client, BaseCommandInteraction } from "discord.js";

export type CommandHandler = (
  client: Client,
  interaction: BaseCommandInteraction
) => Promise<void>;

export type EventHandler = (client: Client, ...args: any[]) => Promise<void>;

export interface Command {
  name: string; // command name
  description: string;
  category?: string;
  handler: CommandHandler;
}

export interface Event {
  name: string; // identifier
  eventType: string;
  handler: EventHandler;
}

export interface Module {
  name: string;
  category?: string;
  commands?: Command[];
  events?: Event[];
}

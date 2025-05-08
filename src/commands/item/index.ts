import { SlashCommandBuilder } from 'discord.js';
import { data as analyzeData } from './analyze';

export const data = new SlashCommandBuilder()
  .setName('item')
  .setDescription('Item-related commands')
  .addSubcommand(analyzeData); // addSubcommand expects SlashCommandSubcommandBuilder

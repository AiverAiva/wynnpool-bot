import { Client, Events, GatewayIntentBits, Interaction, Partials } from 'discord.js';
import { DISCORD_TOKEN } from './config';
import { getCommandHandler } from './commands/index';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages // DM support
  ],
  partials: [Partials.Channel] // Required to receive DMs
});
client.once('ready', () => {
  console.log(`Bot is online as ${client.user?.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;
  const subcommand = interaction.options.getSubcommand(false) ?? undefined;
  const handler = getCommandHandler(commandName, subcommand);

  if (!handler) return interaction.reply({ content: 'Command not found.', ephemeral: true });

  try {
    await handler(interaction);
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: 'Error executing command.', ephemeral: true });
  }
});

(async () => {
  await client.login(DISCORD_TOKEN);
})();

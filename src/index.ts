import { Client, Events, GatewayIntentBits, Interaction, Partials } from 'discord.js';
import { DISCORD_TOKEN } from '@/config';
import { getCommandHandler } from '@/handlers/commandHandler';
import logger from '@/utils/logger';
import { initEmojis } from './utils/emojiFactory';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages // DM support
  ],
  partials: [Partials.Channel] // Required to receive DMs
});
client.once(Events.ClientReady, async () => {
  logger.info(`Logged in as ${client.user?.tag}`);
  await initEmojis(client);
  logger.info(`Emojis initialized`);
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
    logger.error('Error executing command:', err);
    await interaction.reply({ content: 'Error executing command.', ephemeral: true });
  }
});

(async () => {
  await client.login(DISCORD_TOKEN)
    .then(() => logger.info('Bot login successful'))
    .catch(err => logger.error('Login failed', err));
})();

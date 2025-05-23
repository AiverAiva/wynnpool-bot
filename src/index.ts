import { Client, Events, GatewayIntentBits, Interaction, Partials } from 'discord.js';
import { DISCORD_TOKEN } from '@/config';
import { getCommandHandler, getAutocompleteHandler } from '@/handlers/commandHandler';
import logger from '@/utils/logger';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages // DM support
  ],
  partials: [Partials.Channel] // Required to receive DMs
});
client.once('ready', () => {
  logger.info(`Logged in as ${client.user?.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isAutocomplete()) {
    const { commandName } = interaction;
    const subcommand = interaction.options.getSubcommand(false) ?? undefined;
    const autocompleteHandler = getAutocompleteHandler(commandName, subcommand);
    if (autocompleteHandler) {
      try {
        await autocompleteHandler(interaction);
      } catch (err) {
        logger.error('Error in autocomplete handler:', err);
      }
    }
    return;
  }
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

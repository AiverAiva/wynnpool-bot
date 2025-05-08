import { Client, GatewayIntentBits, Interaction, Partials } from 'discord.js';
import { DISCORD_TOKEN } from './config';
import { registerCommands } from './handlers/commandHandler';

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

client.on('interactionCreate', async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {
    const command = await import(`./commands/${interaction.commandName}.ts`);
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'Error executing command.', ephemeral: true });
  }
});

(async () => {
  await registerCommands();
  await client.login(DISCORD_TOKEN);
})();

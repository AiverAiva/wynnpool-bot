import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import path from 'path';
import { DISCORD_TOKEN, CLIENT_ID } from '../config';

export async function registerCommands() {
  const commands = [];
  const commandFiles = readdirSync(path.join(__dirname, '..', 'commands')).filter(file => file.endsWith('.ts'));

  for (const file of commandFiles) {
    const command = await import(`../commands/${file}`);
    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
    }
  }

  const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

  try {
    console.log('Registering slash commands...');
    await rest.put(
        Routes.applicationCommands(CLIENT_ID),
        { body: commands }
      );
    console.log('Commands registered.');
  } catch (error) {
    console.error(error);
  }
}

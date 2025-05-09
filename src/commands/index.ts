import path from 'path';
import fs from 'fs';
import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import { CLIENT_ID, DISCORD_TOKEN } from '@/config';

const commandsMap = new Map<string, Function>();
const slashCommands: any[] = [];

function loadCommandsRecursively(dir: string, baseCmd?: string) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      loadCommandsRecursively(fullPath, file);
    } else if (file.endsWith('.ts') || file.endsWith('.js')) {
      const command = require(fullPath);
      if (command.execute) {
        const cmdName = baseCmd ? `${baseCmd}.${path.parse(file).name}` : path.parse(file).name;
        commandsMap.set(cmdName, command.execute);
        slashCommands.push(command.data.toJSON());
      }
    }
  }
}

loadCommandsRecursively(path.join(__dirname, '../commands'));
export function getCommandHandler(commandName: string, subcommandName?: string) {
  const key = subcommandName ? `${commandName}.${subcommandName}` : commandName;
  return commandsMap.get(key);
}

async function registerSlashCommands() {
 

  if (!DISCORD_TOKEN || !CLIENT_ID ) {
    console.error('Missing BOT_TOKEN, CLIENT_ID, or GUILD_ID in .env');
    return;
  }

  const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

  try {
    console.log('Registering slash commands...');
    await rest.put(Routes.applicationCommands(CLIENT_ID), {
      body: slashCommands,
    });
    console.log(`✅ Registered ${slashCommands.length} slash commands.`);
  } catch (err) {
    console.error('Error registering slash commands:', err);
  }
}

registerSlashCommands();
import path from 'path';
import fs from 'fs';

const commands = new Map();

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
        commands.set(cmdName, command.execute);
      }
    }
  }
}

loadCommandsRecursively(path.join(__dirname, '../commands'));

export function getCommandHandler(commandName: string, subcommandName?: string) {
  const key = subcommandName ? `${commandName}.${subcommandName}` : commandName;
  return commands.get(key);
}
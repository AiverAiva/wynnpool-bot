import {
    AttachmentBuilder,
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder,
} from 'discord.js';

export const data = new SlashCommandSubcommandBuilder()
    .setName('analyze')
    .setDescription('Analyze an encoded item string')
    .addStringOption(opt =>
        opt
            .setName('string')
            .setDescription('The encoded item string')
            .setRequired(true)
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    if (subcommand !== 'analyze') return;

    const itemString = interaction.options.getString('string', true);
    await interaction.deferReply();

    try {
        const response = await fetch('https://api.wynnpool.com/item/decode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ item: itemString }),
        });

        if (!response.ok) {
            throw new Error(`API error ${response.status}`);
        }

        const json = await response.json();
        await interaction.editReply(`Decoded result:\n\`\`\`json\n${JSON.stringify(json, null, 2)}\n\`\`\``);
    } catch (error: any) {
        console.error(error);
        await interaction.editReply(`❌ Error analyzing item: \`${error.message}\``);
    }
}
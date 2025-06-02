import logger from '@/utils/logger';
import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder,
    EmbedBuilder,
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
        const response = await fetch('https://api.wynnpool.com/item/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ item: itemString }),
        });

        if (!response.ok) {
            throw new Error(`API error ${response.status}`);
        }

        const json = await response.json();
        // Format stats
        const stats = Object.entries(json.identifications || {})
            .map(([key, value]: [string, any]) => {
                const stars = value.stars ? '\\*'.repeat(value.stars) : '';
                return `${value.displayValue > 0 ? "+" : ""}${value.displayValue}${stars} ${key} [${Number(value.percentage).toFixed(2)}%]`;
            })
            .join('\n');
        // Get main scale name and value
        const scaleName = Object.keys(json.weightedScores)[0] || 'Main';
        const scaleWeight = json.weightedScores[scaleName] ? Number(json.weightedScores[scaleName]).toFixed(2) : 'N/A';
        const overall = json.overall ? Number(json.overall).toFixed(2) : 'N/A';
        const itemName = json.itemName || 'Unknown';
        // Build embed
        const embed = new EmbedBuilder()
            .setAuthor({ name: 'Wynnpool Weight System' })
            .setTitle('Item weight analysis')
            .setDescription(
                `[Full Weights List](https://weight.wynnpool.com/)\n\n` +
                `**__${scaleName} Weight: ${scaleWeight}%__**\n\n` +
                `${itemName} ${overall}%\n` +
                stats
            )
            .setColor('#00b0f4')
            .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
    } catch (error: any) {
        logger.error(error);
        await interaction.editReply(`❌ Error analyzing item: \`${error.message}\``);
    }
}
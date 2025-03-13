const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticketmess')
        .setDescription('Отправляет сообщение с кнопками для создания тикета')
        .setDefaultMemberPermissions(0),

    async execute(interaction) {
        const channel = interaction.channel;

        const embed = {
            color: 0x0099ff,
            title: "📩 Открытие тикета",
            description: "Выберите тематику вашего обращения, нажав соответствующую кнопку.",
            footer: { text: "Разработчик ответит вам в ближайшее время." }
        };

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('ticket_general')
                .setLabel('📝 Общий вопрос')
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId('ticket_support')
                .setLabel('🛠 Поддержка')
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId('ticket_purchase')
                .setLabel('💰 Покупка модификации')
                .setStyle(ButtonStyle.Secondary)
        );

        await channel.send({ embeds: [embed], components: [row] });

        interaction.reply({ content: "✅ Сообщение с кнопками отправлено!", ephemeral: true });
    }
};

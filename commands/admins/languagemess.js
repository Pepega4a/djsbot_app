const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('languagemess')
        .setDescription('Отправляет сообщение с выбором языка')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    ,

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: '❌ У вас нет прав для использования этой команды.', ephemeral: true });
        }
        const languageMessage = await interaction.channel.send(
            '**🌍 Выберите ваш язык / Choose your language:**\n🇷🇺 Русский\n🇬🇧 English'
        );

        await languageMessage.react('🇷🇺');
        await languageMessage.react('🇬🇧');

        return interaction.reply({ content: '✅ Сообщение отправлено!', ephemeral: true });
    }
};

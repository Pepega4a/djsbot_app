const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('send_language_message')
        .setDescription('Отправляет сообщение с выбором языка')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    ,

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: '❌ У вас нет прав для использования этой команды.', ephemeral: true });
        }
        const languageMessage = await interaction.channel.send(
            '**🌍 Выберите ваш язык\Choose your language:**\n🇷🇺 Русский\n🇬🇧 English'
        );

        await languageMessage.react('flag_ru');
        await languageMessage.react('flag_gb');

        return interaction.reply({ content: '✅ Сообщение отправлено!', ephemeral: true });
    }
};

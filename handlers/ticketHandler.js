const { ChannelType, PermissionFlagsBits, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const supabase = require('../supabase');
const fs = require('fs');
const path = require('path');

const TICKET_CATEGORY_ID = '1349333248504893460'; // ID категории для тикетов
const ROLE_ADMIN = '1349315054327038013'; // ID роли администраторов
const ARCHIVE_CHANNEL_ID = '1349345544992067595'; // Канал, куда будут отправляться архивы

module.exports = async (interaction) => {
    const user = interaction.user;
    const guild = interaction.guild;

    // 🔹 Обрабатываем кнопки создания тикетов
    if (interaction.customId.startsWith('ticket_')) {
        // Проверяем, есть ли у пользователя открытый тикет
        const { data: existingTickets } = await supabase
            .from('tickets')
            .select('*')
            .eq('discord_id', user.id)
            .eq('status', 'open');

        if (existingTickets.length > 0) {
            return interaction.reply({ content: '❌ У вас уже есть открытый тикет!', ephemeral: true });
        }

        // Определяем тему тикета
        let ticketName, topic;
        switch (interaction.customId) {
            case 'ticket_general':
                ticketName = `ticket-${user.username}`;
                topic = 'Общий вопрос';
                break;
            case 'ticket_support':
                ticketName = `support-${user.username}`;
                topic = 'Поддержка';
                break;
            case 'ticket_purchase':
                ticketName = `purchase-${user.username}`;
                topic = 'Покупка модификации';
                break;
            default:
                return;
        }

        // Создаем канал тикета
        const ticketChannel = await guild.channels.create({
            name: ticketName,
            type: ChannelType.GuildText,
            parent: TICKET_CATEGORY_ID,
            topic: `Тикет от ${user.username}: ${topic}`,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: user.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                },
                {
                    id: ROLE_ADMIN,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                }
            ]
        });

        // Записываем тикет в Supabase
        const { error } = await supabase
            .from('tickets')
            .insert([{ discord_id: user.id, ticket_id: ticketChannel.id, category: topic, status: 'open' }]);

        if (error) {
            console.error('Ошибка записи в Supabase:', error);
            return interaction.reply({ content: '❌ Ошибка при создании тикета.', ephemeral: true });
        }

        // Кнопка закрытия тикета
        const closeButton = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('close_ticket')
                .setLabel('❌ Закрыть тикет')
                .setStyle(ButtonStyle.Danger)
        );

        await ticketChannel.send({ content: `🎫 **${user}, ваш тикет создан!**\nОпишите свою проблему.`, components: [closeButton] });

        interaction.reply({ content: `✅ Ваш тикет создан: ${ticketChannel}`, ephemeral: true });
    }

    // 🔹 Обрабатываем кнопку закрытия тикета
    if (interaction.customId === 'close_ticket') {
        const channel = interaction.channel;

        // Проверяем, является ли этот канал тикетом
        const { data: ticket } = await supabase
            .from('tickets')
            .select('*')
            .eq('ticket_id', channel.id)
            .eq('status', 'open')
            .single();

        if (!ticket) {
            return interaction.reply({ content: '❌ Этот канал не является активным тикетом!', ephemeral: true });
        }

        // 📌 Получаем все сообщения из канала
        let messages = await channel.messages.fetch({ limit: 100 });
        messages = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

        let logContent = `<html><head><title>Ticket Archive</title></head><body>`;
        logContent += `<h2>Архив тикета: ${channel.name}</h2><hr>`;

        messages.forEach(msg => {
            logContent += `<p><strong>${msg.author.username}:</strong> ${msg.content} <em>[${new Date(msg.createdTimestamp).toLocaleString()}]</em></p>`;
        });

        logContent += `</body></html>`;

        // 📌 Сохраняем файл (временный)
        const fileName = `ticket_${channel.id}.html`;
        const filePath = path.join(__dirname, '../temp', fileName);

        if (!fs.existsSync(path.join(__dirname, '../temp'))) {
            fs.mkdirSync(path.join(__dirname, '../temp'), { recursive: true });
        }

        fs.writeFileSync(filePath, logContent);

        // 📌 Отправляем файл в канал архивации
        const archiveChannel = await guild.channels.fetch(ARCHIVE_CHANNEL_ID);
        if (archiveChannel) {
            const fileAttachment = new AttachmentBuilder(filePath);
            await archiveChannel.send({ content: `📂 Архив тикета: **${channel.name}**`, files: [fileAttachment] });
        }

        // 📌 Удаляем временный файл после отправки
        fs.unlinkSync(filePath);

        // 📌 Обновляем статус тикета в Supabase
        const { error: updateError } = await supabase
            .from('tickets')
            .update({ status: 'closed' })
            .eq('ticket_id', channel.id);

        if (updateError) {
            console.error('Ошибка при обновлении тикета в Supabase:', updateError);
            return interaction.reply({ content: '❌ Ошибка при закрытии тикета.', ephemeral: true });
        }

        // 📌 Отправляем сообщение о закрытии
        await interaction.reply({ content: '✅ Тикет закрыт и архивирован.', ephemeral: true });

        // Удаляем канал через 5 секунд
        setTimeout(() => channel.delete().catch(console.error), 5000);
    }
};

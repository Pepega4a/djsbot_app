require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { loadCommands, loadEvents } = require('./loader');

const client = new Client({
    intents: [
        // 🔹 Базовые Intent'ы
        GatewayIntentBits.Guilds,                    // Доступ к серверам (обязательно)
        GatewayIntentBits.GuildMembers,              // Отслеживание входа/выхода участников
        GatewayIntentBits.GuildModeration,           // Модерация (баны/кики)
        GatewayIntentBits.GuildEmojisAndStickers,    // Доступ к эмодзи и стикерам
        GatewayIntentBits.GuildIntegrations,         // Доступ к интеграциям
        GatewayIntentBits.GuildWebhooks,             // Управление вебхуками
        GatewayIntentBits.GuildInvites,              // Отслеживание инвайтов
        GatewayIntentBits.GuildVoiceStates,          // Управление голосовыми каналами
        GatewayIntentBits.GuildPresences,            // Отслеживание статусов участников (онлайн/оффлайн)
        GatewayIntentBits.GuildMessages,             // Получение сообщений из каналов
        GatewayIntentBits.GuildMessageReactions,     // Отслеживание реакций на сообщения
        GatewayIntentBits.GuildMessageTyping,        // Отслеживание набора текста в чате
        GatewayIntentBits.DirectMessages,            // Получение ЛС от пользователей
        GatewayIntentBits.DirectMessageReactions,    // Отслеживание реакций в ЛС
        GatewayIntentBits.DirectMessageTyping,       // Отслеживание набора текста в ЛС
        GatewayIntentBits.MessageContent,            // Чтение содержимого сообщений (необходимо для команд)
        GatewayIntentBits.GuildScheduledEvents,      // Управление событиями сервера
        GatewayIntentBits.AutoModerationConfiguration, // Настройка автоматической модерации
        GatewayIntentBits.AutoModerationExecution     // Запуск автоматической модерации
    ],
    partials: [
        // 🔹 Partials для обработки событий, связанных с частично загруженными объектами
        Partials.User,            // Доступ к пользователям (например, при взаимодействии с реакциями)
        Partials.Channel,         // Доступ к каналам (например, DM-каналы)
        Partials.GuildMember,     // Доступ к участникам сервера
        Partials.Message,         // Доступ к сообщениям (нужно для реакций и кэша сообщений)
        Partials.Reaction,        // Доступ к реакциям на сообщения
        Partials.ThreadMember     // Доступ к участникам потоков (Threads)
    ]
});

loadCommands(client);
loadEvents(client);

client.login(process.env.TOKEN);

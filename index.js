require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { loadCommands, loadEvents } = require('./loader');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Загружаем команды и события
loadCommands(client);
loadEvents(client);

// Авторизация
client.login(process.env.TOKEN);

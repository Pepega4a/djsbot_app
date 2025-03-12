const fs = require('fs');
const path = require('path');

/**
 * Функция загрузки команд
 * @param {Client} client - клиент Discord
 */
function loadCommands(client) {
    client.commands = new Map();
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(path.join(commandsPath, file));
        client.commands.set(command.data.name, command);
    }

    console.log(`Загружено ${client.commands.size} команд.`);
}

/**
 * Функция загрузки событий
 * @param {Client} client - клиент Discord
 */
function loadEvents(client) {
    const eventsPath = path.join(__dirname, 'events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const event = require(path.join(eventsPath, file));
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
    }

    console.log(`Загружено ${eventFiles.length} событий.`);
}

module.exports = { loadCommands, loadEvents };

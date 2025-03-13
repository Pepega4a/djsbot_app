const fs = require('fs');
const path = require('path');

/**
 * Рекурсивно загружает файлы из папки и ее поддиректорий.
 * @param {string} dirPath - Путь к папке.
 * @param {string[]} fileList - Список файлов.
 * @returns {string[]} - Полные пути к файлам.
 */
function getAllFiles(dirPath, fileList = []) {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
        const filePath = path.join(dirPath, file);
        if (fs.statSync(filePath).isDirectory()) {
            getAllFiles(filePath, fileList);
        } else if (file.endsWith('.js')) {
            fileList.push(filePath);
        }
    }

    return fileList;
}

/**
 * Загружает команды бота.
 * @param {Client} client - Клиент Discord.js.
 */
function loadCommands(client) {
    client.commands = new Map();
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = getAllFiles(commandsPath);

    for (const filePath of commandFiles) {
        const command = require(filePath);
        if (command.data && command.execute) {
            client.commands.set(command.data.name, command);
        }
    }

    console.log(`✅ Загружено ${client.commands.size} команд.`);
}

/**
 * Загружает события бота.
 * @param {Client} client - Клиент Discord.js.
 */
function loadEvents(client) {
    const eventsPath = path.join(__dirname, 'events');
    const eventFiles = getAllFiles(eventsPath);

    for (const filePath of eventFiles) {
        const event = require(filePath);
        if (event.name && event.execute) {
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args, client));
            } else {
                client.on(event.name, (...args) => event.execute(...args, client));
            }
        }
    }

    console.log(`✅ Загружено ${eventFiles.length} событий.`);
}

module.exports = { loadCommands, loadEvents };

require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.TOKEN;
const APP_ID = process.env.APP_ID;

// Функция для рекурсивного поиска файлов
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

// Загружаем все команды
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = getAllFiles(commandsPath);

for (const filePath of commandFiles) {
    const command = require(filePath);
    if (command.data && command.execute) {
        commands.push(command.data.toJSON());
    }
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log('🚀 Обновление (/) команд...');
        await rest.put(Routes.applicationCommands(APP_ID), { body: commands });
        console.log('✅ Успешно зарегистрированы (/) команды.');
    } catch (error) {
        console.error('❌ Ошибка при регистрации команд:', error);
    }
})();

const handleCommand = require('../../handlers/commandHandler');
const handleTicketButtons = require('../../handlers/ticketHandler');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (interaction.isChatInputCommand()) {
            await handleCommand(interaction, client);
        } else if (interaction.isButton()) {
            await handleTicketButtons(interaction);
        }
    }
};

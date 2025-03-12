const supabase = require('../supabase');

module.exports = {
    name: 'messageReactionAdd',
    async execute(reaction, user) {
        if (user.bot) return;

        const guild = reaction.message.guild;
        const member = await guild.members.fetch(user.id);

        const ROLE_ID_RU = '1349306405626183742';
        const ROLE_ID_EN = '1349306430053945354';

        let language = null;
        let roleId = null;

        if (reaction.emoji.name === 'flag_ru') {
            language = 'ru';
            roleId = ROLE_ID_RU;
        } else if (reaction.emoji.name === 'flag_gb') {
            language = 'en';
            roleId = ROLE_ID_EN;
        }

        if (!language || !roleId) return;

        await member.roles.remove([ROLE_ID_RU, ROLE_ID_EN]).catch(console.error);
        
        await member.roles.add(roleId).catch(console.error);

        // Обновляем язык в базе Supabase
        const { error } = await supabase
            .from('users')
            .update({ language })
            .eq('discord_id', user.id);

        if (error) {
            console.error('❌ Ошибка при обновлении языка в базе:', error);
        } else {
            console.log(`✅ ${user.tag} выбрал язык: ${language} и получил роль.`);
        }
    }
};

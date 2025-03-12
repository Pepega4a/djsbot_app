const supabase = require('../supabase');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        const roleId = '1349306368338821140';

        try {
            const role = member.guild.roles.cache.get(roleId);
            if (role) {
                await member.roles.add(role);
                console.log(`✅ Роль выдана: ${member.user.tag}`);
            } else {
                console.warn('❌ Роль не найдена.');
            }

            // Добавление пользователя в базу Supabase
            const { data, error } = await supabase
                .from('users')
                .upsert([{ discord_id: member.id, language: 'ru', joined_at: new Date() }], { onConflict: ['discord_id'] });

            if (error) console.error('❌ Ошибка при добавлении в базу:', error);
            else console.log(`✅ Пользователь ${member.user.tag} добавлен в базу.`);

        } catch (err) {
            console.error(`❌ Ошибка при выдаче роли: ${err}`);
        }
    }
};

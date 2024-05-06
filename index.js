const { Client, MessageEmbed, Intents, MessageActionRow, MessageButton } = require('discord.js');
const { getVoiceConnection, joinVoiceChannel, VoiceReceiver, EndBehaviorType, createAudioPlayer, NoSubscriberBehavior, createAudioResource } = require('@discordjs/voice');
const { pipeline } = require('stream');
const fs = require('fs');
const { opus } = require('@discordjs/opus');
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_PRESENCES] });
const token = 'TOKEN';
const Prefix = '|';

let c;
let isRec = false;
let connection;

bot.on('ready', () => {
    console.log('Bot Online');
    bot.user.setActivity('ASCII Representatiton | +rep');
})

bot.on('messageCreate', async message => {
    let args = message.content.substring(Prefix.length).split(" ");
    if (!message.content.startsWith(Prefix)) return;

    switch(args[0]) {
        case 'summon':
            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('start')
                        .setLabel('Start Recording')
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('end')
                        .setLabel('End Recording')
                        .setStyle('DANGER'),
                )
                
            await message.channel.send({ content: '-----------------------------', components: [row] });
            break;

    }
})

bot.on('interactionCreate', async button => {
	if (!button.isButton()) { return; }
    switch(button.customId) {
        case 'start':
            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('start')
                        .setLabel('Start Recording')
                        .setStyle('PRIMARY')
                        .setDisabled(true),
                    new MessageButton()
                        .setCustomId('end')
                        .setLabel('End Recording')
                        .setStyle('DANGER'),
                )
            await button.update({ content: 'Rcording...', components: [row] });
            isRec = true;
            let d = new Date().toString().split(' ').join('');
            c = button.member.voice.channel;
            if(!c) return button.channel.send('Join a VC first!');

            //const connection = await c.join();
            connection = joinVoiceChannel({
                channelId: c.id,
                guildId: c.guild.id,
                adapterCreator: c.guild.voiceAdapterCreator,
            });

            const player = createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Pause,
                },
            });
            const resource = createAudioResource('./beep.mp3');
            connection.subscribe(player);
            //player.play(resource);
            let ct = 0;
            player.play(resource);
            const stream = new VoiceReceiver(connection).subscribe(button.user.id, {
                end: {
                    behavior: EndBehaviorType.AfterSilence,
                    duration: 100,
                },
                mode: 'pcm',
            });

            const filename = `./${d}.pcm`;
            const out = fs.createWriteStream('filename.pcm');
            stream.pipe(out);
            stream.on('end', () => { console.log('Done recording'); })
            break;

        case 'end':
            if (isRec) {
                stream.end();
                isRec = false;
            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('start')
                        .setLabel('Start Recording')
                        .setStyle('PRIMARY')
                        .setDisabled(true),
                    new MessageButton()
                        .setCustomId('end')
                        .setLabel('End Recording')
                        .setStyle('DANGER'),
                )
            await button.update({ content: 'Rcording...', components: [row] });
            }
    }
});

bot.login(token);

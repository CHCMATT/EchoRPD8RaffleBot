let { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
let dbCmds = require('./dbCmds.js');

module.exports.postEmbed = async (client) => {
	let countTicketsSold = await dbCmds.readSummValue("countTicketsSold");
	let countUniquePlayers = await dbCmds.readSummValue("countUniquePlayers");

	// Theme Color Palette: https://coolors.co/palette/ffe169-fad643-edc531-dbb42c-c9a227-b69121-a47e1b-926c15-805b10-76520e

	countTicketsSold = countTicketsSold.toString();
	countUniquePlayers = countUniquePlayers.toString();

	let raffleItemEmbed = new EmbedBuilder()
		.setTitle(`Mount Gordo Lighthouse House Raffle`)
		.setImage(`https://i.imgur.com/BYMmwY4.jpg`)
		.setColor(`A47E1B`)

	let ticketsSoldEmbed = new EmbedBuilder()
		.setTitle('Amount of Raffle Tickets Sold:')
		.setDescription(countTicketsSold)
		.setColor('B69121');

	let uniquePlayersEmbed = new EmbedBuilder()
		.setTitle('Amount of Different Raffle Participants:')
		.setDescription(countUniquePlayers)
		.setColor('C9A227');

	let btnRows = addBtnRows();

	client.embedMsg = await client.channels.cache.get(process.env.EMBED_CHANNEL_ID).send({ embeds: [raffleItemEmbed, ticketsSoldEmbed, uniquePlayersEmbed], components: btnRows });

	await dbCmds.setMsgId("embedMsg", client.embedMsg.id);
};

function addBtnRows() {
	let row1 = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('addTickets')
			.setLabel('Add Tickets Sold')
			.setStyle(ButtonStyle.Success),

		new ButtonBuilder()
			.setCustomId('removeTickets')
			.setLabel('Remove Tickets Sold')
			.setStyle(ButtonStyle.Danger),

		new ButtonBuilder()
			.setCustomId('completeRaffle')
			.setLabel('End Raffle')
			.setStyle(ButtonStyle.Primary),
	);

	let rows = [row1];
	return rows;
};
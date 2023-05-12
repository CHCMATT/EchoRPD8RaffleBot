let { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
let dbCmds = require('./dbCmds.js');

module.exports.postEmbed = async (client) => {
	let countTicketsSold = await dbCmds.readSummValue("countTicketsSold");
	let countUniquePlayers = await dbCmds.readSummValue("countUniquePlayers");

	// Theme Color Palette: https://coolors.co/palette/d9ed92-b5e48c-99d98c-76c893-52b69a-34a0a4-168aad-1a759f-1e6091-184e77

	countTicketsSold = countTicketsSold.toString();
	countUniquePlayers = countUniquePlayers.toString();

	let raffleItemEmbed = new EmbedBuilder()
		.setTitle(`Mount Gordo Lighthouse House Raffle`)
		.setImage(`https://i.imgur.com/BYMmwY4.jpg`)
		.setColor(`34A0A4`)

	let ticketsSoldEmbed = new EmbedBuilder()
		.setTitle('Amount of Raffle Tickets Sold:')
		.setDescription(countTicketsSold)
		.setColor('52B69A');

	let uniquePlayersEmbed = new EmbedBuilder()
		.setTitle('Amount of Different Raffle Participants:')
		.setDescription(countUniquePlayers)
		.setColor('99D98C');

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
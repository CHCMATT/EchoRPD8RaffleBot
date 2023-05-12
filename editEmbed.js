let dbCmds = require('./dbCmds.js');
let { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports.editEmbed = async (client, buttonStatus) => {
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

	let btnRows = addBtnRows(buttonStatus);

	let currEmbed = await dbCmds.readMsgId("embedMsg");

	let channel = await client.channels.fetch(process.env.EMBED_CHANNEL_ID)
	let currMsg = await channel.messages.fetch(currEmbed);

	currMsg.edit({ embeds: [raffleItemEmbed, ticketsSoldEmbed, uniquePlayersEmbed], components: btnRows });
};

function addBtnRows(buttonStatus) {
	if (buttonStatus == `enabled`) {
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
	} else {
		let row1 = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId('addTickets')
				.setLabel('Add Tickets Sold')
				.setStyle(ButtonStyle.Success)
				.setDisabled(true),

			new ButtonBuilder()
				.setCustomId('removeTickets')
				.setLabel('Remove Tickets Sold')
				.setStyle(ButtonStyle.Danger)
				.setDisabled(true),

			new ButtonBuilder()
				.setCustomId('completeRaffle')
				.setLabel('End Raffle')
				.setStyle(ButtonStyle.Primary)
				.setDisabled(true),
		);
		let rows = [row1];
		return rows;
	}
};
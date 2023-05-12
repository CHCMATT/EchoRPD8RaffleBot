let dbCmds = require('./dbCmds.js');
let { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports.editEmbed = async (client, buttonStatus) => {
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
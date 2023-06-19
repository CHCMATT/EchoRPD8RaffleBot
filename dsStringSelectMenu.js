let dbCmds = require('./dbCmds.js');
let editEmbed = require('./editEmbed.js');
var commissionCmds = require('./commissionCmds.js');
let { EmbedBuilder } = require('discord.js');

let formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
});

module.exports.stringSelectMenuSubmit = async (interaction) => {
	try {
		var selectStringMenuID = interaction.customId;
		switch (selectStringMenuID) {
			case 'endRaffleConfirmation':
				if (interaction.values[0] == 'confirmEndRaffle') {
					await interaction.deferReply({ ephemeral: true });
					let ticketsSold = await dbCmds.readTicketSales();
					let everyTicket = [];

					if (ticketsSold.length > 0) {
						for (let i = 0; i < ticketsSold.length; i++) {
							let currPlayer = ticketsSold[i];
							let playerTickets = currPlayer.ticketsBought;
							while (playerTickets > 0) {
								everyTicket.push(currPlayer.charName);
								playerTickets--;
							}
						}

						let now = Math.floor(new Date().getTime() / 1000.0);
						let dateTime = `<t:${now}:d>`;
						let totalTickets = everyTicket.length;
						let winnerEntry = Math.floor(Math.random() * totalTickets);
						let winnerData = await dbCmds.lookupPlayerByName(everyTicket[winnerEntry]);

						let ticketsToReset = await dbCmds.readTicketSales();
						for (let i = 0; i < ticketsToReset.length; i++) {
							await dbCmds.resetTickets(ticketsToReset[i].citizenId);
						}

						await editEmbed.editEmbed(interaction.client, `disabled`);

						let overallD8Profit = await dbCmds.readSummValue("d8Profit");
						let overallD8Cost = await dbCmds.readSummValue("d8Cost");
						let overallTicketsSold = await dbCmds.readSummValue("countTicketsSold");
						let overallUniquePlayers = await dbCmds.readSummValue("countUniquePlayers");
						let indivTicketPrice = 5000;
						let indivCommission = 1000;
						let totalOverallMoney = (overallTicketsSold * indivTicketPrice);
						let totalCommission = (overallTicketsSold * indivCommission);

						let formattedTotalOverallMoney = formatter.format(totalOverallMoney);
						let formattedTotalCommission = formatter.format(totalCommission);

						let formattedOverallD8Profit = formatter.format(overallD8Profit);
						let formattedOverallD8Cost = formatter.format(overallD8Cost);

						var upstairsEmbed1 = new EmbedBuilder()
							.setTitle(`The \`Mount Gordo Lighthouse House\` Raffle was completed on ${dateTime}!`)
							.addFields(
								{ name: `Winner Name:`, value: `${winnerData.charName}`, inline: true },
								{ name: `Citizen ID:`, value: `${winnerData.citizenId}`, inline: true },
								{ name: `Phone Number:`, value: `${winnerData.phoneNum}`, inline: true },
								{ name: `Amount of Tickets Purchased:`, value: `${winnerData.ticketsBought}` },
								{ name: `Raffle Completed By:`, value: `<@${interaction.user.id}>` },
							)
							.setColor('EDC531');

						var upstairsEmbed2 = new EmbedBuilder()
							.setTitle(`The \`Mount Gordo Lighthouse House\` Raffle breakdown for Dynasty 8`)
							.addFields(
								{ name: `Total Tickets Sold:`, value: `${overallTicketsSold}`, inline: true },
								{ name: `Unique Participants:`, value: `${overallUniquePlayers}`, inline: true },
								{ name: `Total Money Accepted:`, value: `${formattedTotalOverallMoney}` },
								{ name: `Total Commission Paid:`, value: `${formattedTotalCommission}`, inline: true },
								{ name: `Dynasty 8 Profit:`, value: `${formattedOverallD8Profit}`, inline: true },
								{ name: `Dynasty 8 House Cost:`, value: `${formattedOverallD8Cost}`, inline: true },
							)
							.setColor('FAD643');

						await interaction.client.channels.cache.get(process.env.CEO_COO_OFFICE_CHANNEL_ID).send({ embeds: [upstairsEmbed1, upstairsEmbed2] });

						await dbCmds.resetSummValue("countTicketsSold");
						await dbCmds.resetSummValue("countUniquePlayers");
						await dbCmds.resetSummValue("d8Profit");
						await dbCmds.resetSummValue("d8Cost");

						// Theme Color Palette: https://coolors.co/palette/ffe169-fad643-edc531-dbb42c-c9a227-b69121-a47e1b-926c15-805b10-76520e

						var winnerEmbed = [new EmbedBuilder()
							.setTitle(`A winner for the \`Mount Gordo Lighthouse House\` Raffle has been selected on ${dateTime}! :tada:`)
							.addFields(
								{ name: `Winner Name:`, value: `${winnerData.charName}` },
								{ name: `Citizen ID:`, value: `${winnerData.citizenId}`, inline: true },
								{ name: `Phone Number:`, value: `${winnerData.phoneNum}`, inline: true },
								{ name: `Amount of Tickets Purchased:`, value: `${winnerData.ticketsBought}` },
							)
							.setColor('DBB42C')];

						await interaction.client.channels.cache.get(process.env.EMBED_CHANNEL_ID).send({ embeds: winnerEmbed });

						await commissionCmds.commissionReport(interaction.client);

						await interaction.editReply({ content: `Successfully ended the raffle!`, components: [], ephemeral: true });
					} else {
						await interaction.editReply({ content: `:exclamation: There are no tickets sold yet for this raffle!`, components: [], ephemeral: true });
					}
				} else if (interaction.values[0] == 'denyEndRaffle') {
					await interaction.reply({ content: `The raffle was not ended and will continue running!`, components: [], ephemeral: true });
				}
				break;
			default:
				await interaction.reply({
					content: `I'm not familiar with this string select type. Please tag @CHCMATT to fix this issue.`,
					ephemeral: true
				});
				console.log(`Error: Unrecognized modal ID: ${interaction.customId}`);
		}
	} catch (error) {
		var errTime = moment().format('MMMM Do YYYY, h:mm:ss a');;
		var fileParts = __filename.split(/[\\/]/);
		var fileName = fileParts[fileParts.length - 1];

		var errorEmbed = [new EmbedBuilder()
			.setTitle(`An error occured on the ${process.env.BOT_NAME} bot file ${fileName}!`)
			.setDescription(`\`\`\`${error.toString().slice(0, 2000)}\`\`\``)
			.setColor('B80600')
			.setFooter({ text: `${errTime}` })];

		await interaction.client.channels.cache.get(process.env.ERROR_LOG_CHANNEL_ID).send({ embeds: errorEmbed });

		console.log(`Error occured at ${errTime} at file ${fileName}!`);
		console.error(error);
	}
};



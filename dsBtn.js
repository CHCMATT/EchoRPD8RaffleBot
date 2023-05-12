let dbCmds = require('./dbCmds.js');
let editEmbed = require('./editEmbed.js');
var commissionCmds = require('./commissionCmds.js');
let { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionsBitField, EmbedBuilder } = require('discord.js');

let formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
});

module.exports.btnPressed = async (interaction) => {
	try {
		var buttonID = interaction.customId;
		switch (buttonID) {
			case 'addTickets':
				var addTicketsModal = new ModalBuilder()
					.setCustomId('addTicketsModal')
					.setTitle('Add raffle tickets that you sold');
				var buyerNameInput = new TextInputBuilder()
					.setCustomId('buyerNameInput')
					.setLabel("What is the buyer's full name?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('FirstName LastName')
					.setRequired(true);
				var citizenIdInput = new TextInputBuilder()
					.setCustomId('citizenIdInput')
					.setLabel("What the buyer's Citizen ID?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('2634')
					.setRequired(true);
				var phoneNumberInput = new TextInputBuilder()
					.setCustomId('phoneNumberInput')
					.setLabel("What the buyer's phone number?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('219-892-4563')
					.setRequired(true);
				var ticketQuantityInput = new TextInputBuilder()
					.setCustomId('ticketQuantityInput')
					.setLabel("How many tickets did they purchase?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('4')
					.setRequired(true);

				var buyerNameInputRow = new ActionRowBuilder().addComponents(buyerNameInput);
				var citizenIdInputRow = new ActionRowBuilder().addComponents(citizenIdInput);
				var phoneNumberInputRow = new ActionRowBuilder().addComponents(phoneNumberInput);
				var ticketQuantityInputRow = new ActionRowBuilder().addComponents(ticketQuantityInput);

				addTicketsModal.addComponents(buyerNameInputRow, citizenIdInputRow, phoneNumberInputRow, ticketQuantityInputRow);

				await interaction.showModal(addTicketsModal);
				break;
			case 'removeTickets':
				var removeTicketsModal = new ModalBuilder()
					.setCustomId('removeTicketsModal')
					.setTitle('Remove raffle tickets that you sold');
				var buyerNameInput = new TextInputBuilder()
					.setCustomId('buyerNameInput')
					.setLabel("What is the former buyer's full name?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('FirstName LastName')
					.setRequired(true);
				var citizenIdInput = new TextInputBuilder()
					.setCustomId('citizenIdInput')
					.setLabel("What is the former buyer's Citizen ID?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('3962')
					.setRequired(true);
				var ticketQuantityInput = new TextInputBuilder()
					.setCustomId('ticketQuantityInput')
					.setLabel("How many tickets should be removed?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('2')
					.setRequired(true);

				var buyerNameInputRow = new ActionRowBuilder().addComponents(buyerNameInput);
				var citizenIdInputRow = new ActionRowBuilder().addComponents(citizenIdInput);

				var ticketQuantityInputRow = new ActionRowBuilder().addComponents(ticketQuantityInput);

				removeTicketsModal.addComponents(buyerNameInputRow, citizenIdInputRow, ticketQuantityInputRow);

				await interaction.showModal(removeTicketsModal);
				break;
			case 'completeRaffle':
				if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
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
								{ name: `Amount of Tickets Purchase:`, value: `${winnerData.ticketsBought}` },
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

						await interaction.client.channels.cache.get(process.env.THE_UPSTAIRS_CHANNEL_ID).send({ embeds: [upstairsEmbed1, upstairsEmbed2] });

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
								{ name: `Amount of Tickets Purchase:`, value: `${winnerData.ticketsBought}` },
							)
							.setColor('DBB42C')];

						await interaction.client.channels.cache.get(process.env.EMBED_CHANNEL_ID).send({ embeds: winnerEmbed });

						await commissionCmds.commissionReport(interaction.client);

						await interaction.reply({ content: `Successfully ended the raffle!`, ephemeral: true });
					} else {
						await interaction.reply({ content: `:exclamation: There are no tickets sold yet for this raffle!`, ephemeral: true });
					}
				} else {
					await interaction.reply({ content: `:x: You must have the \`Administrator\` permission to use this function.`, ephemeral: true });
				}
				break;
			default:
				await interaction.reply({ content: `I'm not familiar with this button press. Please tag @CHCMATT to fix this issue.`, ephemeral: true });
				console.log(`Error: Unrecognized button press: ${interaction.customId}`);
		}
	}
	catch (error) {
		console.log(`Error in button press!`);
		console.error(error);
	}
};
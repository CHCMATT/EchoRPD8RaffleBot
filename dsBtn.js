let dbCmds = require('./dbCmds.js');
let editEmbed = require('./editEmbed.js');
var commissionCmds = require('./commissionCmds.js');
let { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionsBitField, EmbedBuilder } = require('discord.js');

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

						await dbCmds.resetSummValue("countTicketsSold");
						await dbCmds.resetSummValue("countUniquePlayers");

						// Theme Color Palette: https://coolors.co/palette/d9ed92-b5e48c-99d98c-76c893-52b69a-34a0a4-168aad-1a759f-1e6091-184e77

						var winnerEmbed = [new EmbedBuilder()
							.setTitle(`A winner for the \`Mount Gordo Lighthouse House\` Raffle has been selected on ${dateTime}! :tada:`)
							.addFields(
								{ name: `Winner Name:`, value: `${winnerData.charName}` },
								{ name: `Citizen ID:`, value: `${winnerData.citizenId}`, inline: true },
								{ name: `Phone Number:`, value: `${winnerData.phoneNum}`, inline: true },
								{ name: `Amount of Tickets Purchase:`, value: `${winnerData.ticketsBought}` },
							)
							.setColor('168AAD')];

						await interaction.client.channels.cache.get(process.env.EMBED_CHANNEL_ID).send({ embeds: winnerEmbed });

						await commissionCmds.commissionReport(interaction.client);
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
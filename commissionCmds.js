var dbCmds = require('./dbCmds.js');
var { EmbedBuilder } = require('discord.js');

var formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
});

module.exports.commissionReport = async (client) => {
	var now = Math.floor(new Date().getTime() / 1000.0);
	var today = `<t:${now}:d>`;

	var peopleArray = await dbCmds.commissionRep();
	var commissionDescList = '';

	for (i = 0; i < peopleArray.length; i++) {
		commissionDescList = commissionDescList.concat(`• **${peopleArray[i].charName}**: ${formatter.format(peopleArray[i].currentCommission)}\n`);
		await dbCmds.resetCommission(peopleArray[i].discordId);
	}

	if (commissionDescList == '') {
		commissionDescList = "There is no commission to pay."
	}

	var commissionEmbed = new EmbedBuilder()
		.setTitle(`Commission Report for \`Mount Gordo Lighthouse House\` Raffle:`)
		.setDescription(commissionDescList)
		.setColor('1A759F');
	await client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [commissionEmbed] });

	// color palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630

	var reason = `Commission Report triggered on ${today}`
	var notificationEmbed = new EmbedBuilder()
		.setTitle('Commission Modified Automatically:')
		.setDescription(`\`System\` reset all raffle commissions to \`$0\`.\n\n**Reason:** ${reason}.`)
		.setColor('#1EC276');
	await client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed] });
};
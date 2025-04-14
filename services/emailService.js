const sgMail = require('@sendgrid/mail');

const apiKey = process.env.SENDGRID_API_KEY;

if (!apiKey) {
	console.error('SENDGRID_API_KEY is not set. Email sending will be disabled.');
} else {
	sgMail.setApiKey(apiKey);
	console.log('SendGrid API Key configured.');
}

const sendEmail = async ({ to, subject, text, html, from }) => {
	if (!apiKey) {
		console.warn(
			`Email not sent to ${to} because SendGrid API key is missing.`
		);

		return;
	}

	const msg = {
		to,
		from: from || process.env.EMAIL_FROM || 'noreply@example.com',
		subject,
		text,
		html,
	};

	try {
		await sgMail.send(msg);
		console.log(`Email sent successfully to ${to}`);
	} catch (error) {
		console.error(`Error sending email via SendGrid to ${to}:`);
		if (error.response) {
			console.error('SendGrid Error Response:', error.response.body.errors);
		}
		// Re-throw a generic error to be caught by the controller
		throw new Error('Failed to send invitation email.');
	}
};

// Specific function for sending the invitation email
const sendTeamInvitationEmail = async (
	invitedEmail,
	inviterName,
	teamName,
	invitationToken
) => {
	const clientUrl = process.env.CLIENT_URL;
	const invitationLink = `${clientUrl}/invite/${invitationToken}`;

	const subject = `Invitation to join ${teamName} on Your Kanban App`;
	const text = `Hello,\n\n${inviterName} has invited you to join the team "${teamName}" on Your Kanban App.\n\nPlease click the following link to accept or decline:\n${invitationLink}\n\nThis link will expire in 48 hours.\n\nIf you did not expect this invitation, please ignore this email.\n\nThanks,\nThe Your Kanban App Team`;
	const html = `<p>Hello,</p>
                  <p>${inviterName} has invited you to join the team "<strong>${teamName}</strong>" on Your Kanban App.</p>
                  <p>Please click the button below to accept or decline (link expires in 48 hours):</p>
                  <a href="${invitationLink}" style="background-color: #635FC7; color: white; padding: 12px 20px; text-decoration: none; border-radius: 24px; display: inline-block; font-weight: bold;">View Invitation</a>
                  <p>If the button doesn't work, copy and paste this link into your browser:</p>
                  <p>${invitationLink}</p>
                  <p>If you did not expect this invitation, please ignore this email.</p>
                  <p>Thanks,<br/>The Your Kanban App Team</p>`; // Customize styling/branding

	await sendEmail({
		to: invitedEmail,
		from: process.env.EMAIL_FROM,
		subject,
		text,
		html,
	});
};

module.exports = { sendTeamInvitationEmail };

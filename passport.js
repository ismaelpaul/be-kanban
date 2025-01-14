const passport = require('passport');
const {
	checkUserExistsByEmail,
	insertGoogleOrGithubUser,
} = require('./models/auth.models');
const { insertBoard } = require('./models/boards.models');
const {
	insertTeamMembersIntoTeam,
	insertTeam,
} = require('./models/teams.models');

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: '/auth/google/callback',
		},
		async function (accessToken, refreshToken, profile, done) {
			try {
				const payload = profile._json;

				const existingUser = await checkUserExistsByEmail(payload.email);

				if (existingUser.userExists) {
					return done(null, existingUser.user);
				} else {
					const user = {
						first_name: payload.given_name,
						last_name: payload.family_name,
						email: payload.email,
						avatar: payload.picture,
					};

					const newUser = await insertGoogleOrGithubUser(user);

					const newTeam = await insertTeam('Private Team');

					if (newUser && newTeam) {
						await insertTeamMembersIntoTeam(newUser.user_id, newTeam.team_id);
						await insertBoard(newTeam.team_id, 'New Board');
					}

					return done(null, newUser);
				}
			} catch (error) {
				console.error(error.message);
				return done(null, false);
			}
		}
	)
);

passport.use(
	new GitHubStrategy(
		{
			clientID: process.env.GITHUB_CLIENT_ID,
			clientSecret: process.env.GITHUB_CLIENT_SECRET,
			callbackURL: '/auth/github/callback',
		},
		async function (accessToken, refreshToken, profile, done) {
			try {
				const emailResponse = await fetch(
					'https://api.github.com/user/emails',
					{
						headers: {
							Authorization: `Bearer ${accessToken}`,
							'User-Agent': 'kanban',
						},
					}
				);
				const emailData = await emailResponse.json();

				// Find the primary email
				const primaryEmail = emailData.find((email) => email.primary);

				if (primaryEmail) {
					const existingUser = await checkUserExistsByEmail(primaryEmail.email);

					if (existingUser.userExists) {
						return done(null, existingUser.user);
					} else {
						const nameArray = profile.displayName.split(' ');
						const firstName = nameArray[0];
						const lastName = nameArray[nameArray.length - 1];

						const user = {
							first_name: firstName,
							last_name: lastName,
							email: primaryEmail.email,
							avatar: profile.photos[0].value,
						};

						const newUser = await insertGoogleOrGithubUser(user);
						const newTeam = await insertTeam('Private Team');

						if (newUser && newTeam) {
							await insertTeamMembersIntoTeam(newUser.user_id, newTeam.team_id);
							await insertBoard(newTeam.team_id, 'New Board');
						}
						return done(null, newUser);
					}
				} else {
					console.error('No primary email found.');
					return done(null, false);
				}
			} catch (error) {
				console.error(error.message);
				return done(null, false);
			}
		}
	)
);

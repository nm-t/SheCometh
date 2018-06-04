const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete credentials.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const TOKEN_PATH = 'credentials.json';

// Load client secrets from a local file.
try {
  const content = fs.readFileSync('client_secret.json');
  authorize(JSON.parse(content), listEvents);
} catch (err) {
  return console.log('Error loading client secret file:', err);
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 * @return {function} if error in reading credentials.json asks for a new one.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  let token = {};
  const oAuth2Client = new google.auth.OAuth2(
	  client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  try {
	token = fs.readFileSync(TOKEN_PATH);
  } catch (err) {
	return getAccessToken(oAuth2Client, callback);
  }
  oAuth2Client.setCredentials(JSON.parse(token));
  callback(oAuth2Client);
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
	access_type: 'offline',
	scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
	rl.close();
	oAuth2Client.getToken(code, (err, token) => {
	  if (err) return callback(err);
	  oAuth2Client.setCredentials(token);
	  // Store the token to disk for later program executions
	  try {
		fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
		console.log('Token stored to', TOKEN_PATH);
	  } catch (err) {
		console.error(err);
	  }
	  callback(oAuth2Client);
	});
  });
}

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(auth) {
	const calendar = google.calendar({version: 'v3', auth});
	calendar.events.list({
		calendarId: 'primary',
		timeMin: new Date(new Date()-2592000000).toISOString(), // 1 month in the past
		singleEvents: true,
		orderBy: 'startTime',
	}, (err, {data}) => {
		if (err) return console.log('The API returned an error: ' + err);
		const events = data.items;
		
		if (events.length) {
			console.log('The crimson tide last struck:');
			events.map((event, i) => {
				if (event.summary === 'She Cometh'){
					// Get most recent She Cometh
					const start = event.start.dateTime || event.start.date;
					console.log(`${start} - ${event.summary}`);

					// Check it hasn't been modified for 10 days
					let today = new Date();
					let daysUntouched = 5 * 24 * 60 * 60 * 1000;
					if (event.updated < (new Date(today - daysUntouched))){
						console.log('she old');
					}

					// Create the new event for next month
					const end = event.end.dateTime || event.end.date;
					// PlanTheComing(end);


					let offset = 28 * 24 * 60 * 60 * 1000;
					var lastDay = new Date(end);
					var newDate = new Date(lastDay.getTime() + offset);
				
					var event = {
						'summary': 'She Cometh - Node edition!',
						'start': {
							'dateTime': new Date(),
							'timeZone': 'Australia/Melbourne',
						},
						'end': {
							'dateTime': newDate,
							'timeZone': 'Australia/Melbourne',
						},
						};
						
						calendar.events.insert({
						auth: auth,
						calendarId: 'primary',
						resource: event,
						}, function(err, event) {
						if (err) {
							console.log('There was an error contacting the Calendar service: ' + err);
							return;
						}
						console.log('Event created: %s', event.htmlLink);
					});


				}
			});
		}
		
		else {
		  console.log('She has never cometh.');
		}
	});
}

/**
 * Creates a new She Cometh event for 28 days in the future from the last one
 * @param {date} lastDay 
 */
function PlanTheComing(lastDay) {
	let offset = 28 * 24 * 60 * 60 * 1000;
	var lastDay = new Date(lastDay);
	var newDate = new Date(lastDay.getTime() + offset);

	var event = {
		'summary': 'She Cometh - Node edition!',
		'start': {
			'date': '2018-06-07',
			'timeZone': 'Australia/Melbourne',
		},
		'end': {
			'date': newDate,
			'timeZone': 'Australia/Melbourne',
		},
		};
		
		calendar.events.insert({
		auth: auth,
		calendarId: 'primary',
		resource: event,
		}, function(err, event) {
		if (err) {
			console.log('There was an error contacting the Calendar service: ' + err);
			return;
		}
		console.log('Event created: %s', event.htmlLink);
	});
}
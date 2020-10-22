const {google} = require('googleapis');
const calendar = google.calendar('v3');
const OAuth2 = google.auth.OAuth2; 
const functions = require('firebase-functions');
const googleCredentials = require('./credentials.json');
const TIME_ZONE = 'EAT';

exports.addToCalendar = functions.firestore.document('Calendar/{pushId}')
  .onWrite( async(change) => {
    const data = change.after.exists ? change.after.data() : null;
      const eventData = {
      	summary: data.eventName,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime, 
        teacherMail: data.teacherMail
    };

    return addEventToGoogleCalendar(eventData)
  }); 
function addEventToGoogleCalendar(event) {
	  const oAuth2Client = new OAuth2(
        googleCredentials.web.client_id,
        googleCredentials.web.client_secret,
        googleCredentials.web.redirect_uris[0]
    );

    oAuth2Client.setCredentials({
        refresh_token: googleCredentials.refresh_token
    });
  return new Promise((resolve, reject) => {
    calendar.events.insert({
      auth: oAuth2Client,
      calendarId: 'primary',
      resource: {
 				'summary': event.summary,
                'description': event.description,
                'start': {
                    'dateTime': event.startTime,
                    'timeZone': TIME_ZONE,
                },
                'end': {
                    'dateTime': event.endTime,
                    'timeZone': TIME_ZONE,
                },
               'recurrence': [
    			 'RRULE:FREQ=WEEKLY;COUNT=14'
  				],
  				 'attendees': [
   			 {'email': event.teacherMail}
  			],
            },
    }, function(err, event) {
      if (err) {
        console.error(err);
        reject(err);
      }
      else {
        resolve();
      }
    });
  });
}


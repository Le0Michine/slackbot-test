// import rp from 'minimal-request-promise';
import https from 'https';
import SlackMessageBuilder from './slack/slack-message-builder';
import SlackHelper from './slack/slack-helper';
import SlackApp from './slack/slack-app.base';
import DynamoDBHelper from './dynamo-db';
import isAuthorized from './auth';
import { appName, appPermToken } from './env';
import generateWebexLink from './webex-link'; // (string, string) => string

console.log('Loading event');

exports.handler = SlackApp.create(isAuthorized, {
    '/webex-room': getLink
});

function getLink(event, context, callback) {
    const { text, team_id, team_domain, response_url, token, command } = event;
    const userRegex = /<@.*?\|.*?>/;

    if (!text || !userRegex.test(text)) {
        const responseBody = new SlackMessageBuilder()
            .asEphemeral()
            .setText(`Error: you should pass user name '@user'`)
            .appendAttachment(text)
            .get();
        SlackHelper.sendDelayedResponse(response_url, JSON.stringify(responseBody), callback);
        return;
    }

    const [userId, userName] = text.match(userRegex)[0].slice(2,-1).split('|');
    const url = `https://slack.com/api/users.info?token=${appPermToken()}&user=${userId}`;

    console.log('perform request', url);

    https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);

        res.on('end', () => {
            try {
                const response = JSON.parse(data);
                console.log('got user profile: ' + JSON.stringify(response, null, '  '));
                const userFirstName = response.user.profile.first_name;
                const userLastName = response.user.profile.last_name;
                const responseBody = new SlackMessageBuilder()
                    .asInChannel()
                    .setText(`<${generateWebexLink(userFirstName, userLastName)}|${userName} webex>`)
                    .get();
                SlackHelper.sendDelayedResponse(response_url, JSON.stringify(responseBody), callback);
            } catch (e) {
                console.log('failed to process server response ', e);
                const responseBody = new SlackMessageBuilder()
                    .asInChannel()
                    .setText(`Error: unable to get user info`)
                    .get();
                SlackHelper.sendDelayedResponse(response_url, JSON.stringify(responseBody), callback);
            }
        });

        res.on('error', e => {
            console.log('failed to get user info: ', e);
            const responseBody = new SlackMessageBuilder()
                .asEphemeral()
                .setText(`Error: failed to get user profile`)
                .appendAttachment(text)
                .get();
            SlackHelper.sendDelayedResponse(response_url, JSON.stringify(responseBody), callback);
        });
    });
    callback();
}

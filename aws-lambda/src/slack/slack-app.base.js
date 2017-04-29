import SlackMessageBuilder from './slack-message-builder';
import SlackHelper from './slack-helper';

export default class SlackApp {
    static create(isAuthorized, commandActions) {
        return (event, context, callback) => {
            const { text, team_id, team_domain, response_url, token, command } = event;
            console.log('call function with ' + JSON.stringify(event, null, '  '));
            if (!isAuthorized(token)) {
                const responseBody = new SlackMessageBuilder()
                    .asEphemeral()
                    .setText(`Error: unauthorized`)
                    .get();
                SlackHelper.sendDelayedResponse(response_url, JSON.stringify(responseBody), callback);
                callback('Unauthorized');
                return;
            }

            if (commandActions[command]) {
                commandActions[command](event, context, callback);
            } else {
                console.log('unknown command');
                const responseBody = new SlackMessageBuilder()
                    .asEphemeral()
                    .setText(`Error: unknown command`)
                    .appendAttachment(command)
                    .get();
                SlackHelper.sendDelayedResponse(response_url, JSON.stringify(responseBody), callback);
            }
        };
    }
}
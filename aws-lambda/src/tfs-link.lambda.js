// import rp from 'minimal-request-promise';
import SlackMessageBuilder from './slack/slack-message-builder';
import SlackHelper from './slack/slack-helper';
import SlackApp from './slack/slack-app.base';
import DynamoDBHelper from './dynamo-db';
import isAuthorized from './auth';
import { appName } from './env'; // string

console.log('Loading event');

exports.handler = SlackApp.create(isAuthorized, {
    '/tfs-item': getLink,
    '/set-tfs-url': setLink,
});

function getLink(event, context, callback) {
    const { text, team_id, team_domain, response_url, token, command } = event;
    const ids = (text || '').split(/[., ]/).map(x => +x).filter(x => !!x);

    if (!text || /^ *$/.test(text) || !ids.length) {
        const responseBody = new SlackMessageBuilder()
            .asEphemeral()
            .setText(`Error: you should pass comma separated list of tfs item ids`)
            .appendAttachment(text)
            .get();
        SlackHelper.sendDelayedResponse(response_url, JSON.stringify(responseBody), callback);
        return;
    }

    DynamoDBHelper.getLink(team_id, team_domain, appName())
        .then(link => {
            console.log('got link, send response', link);
            const responseBody = new SlackMessageBuilder()
                .asInChannel()
                .setText(ids.map(x => `<${link}${x}|Item ${x}>`).join(', '))
                .get();
            SlackHelper.sendDelayedResponse(response_url, JSON.stringify(responseBody), callback);
            callback(null, 'success');
        })
        .catch(err => {
            console.log('failed to get link', err);
            const responseBody = new SlackMessageBuilder()
                .asEphemeral()
                .setText(`Error: ${err}`)
                .get();
            SlackHelper.sendDelayedResponse(response_url, JSON.stringify(responseBody), callback);
        });
}

function setLink(event, context, callback) {
    const { text, team_id, team_domain, response_url, token, command } = event;
    if (!text) {
        const responseBody = new SlackMessageBuilder().setText('Error: link cann\'t be empty').asEphemeral().get();
        SlackHelper.sendDelayedResponse(response_url, JSON.stringify(responseBody), callback);
        return;
    }

    DynamoDBHelper.putItem(team_id, team_domain, appName(), text)
        .then(res => {
            const responseBody = new SlackMessageBuilder().setText('Link updated to:').appendAttachment(res).asEphemeral().get();
            SlackHelper.sendDelayedResponse(response_url, JSON.stringify(responseBody), callback);
        })
        .catch(err => {
            const responseBody = new SlackMessageBuilder().setText('Error: failed to update link').asEphemeral().get();
            SlackHelper.sendDelayedResponse(response_url, JSON.stringify(responseBody), callback);
        });
};

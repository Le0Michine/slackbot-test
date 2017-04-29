import https from 'https';
import SlackMessageBuilder from './slack-message-builder';

export default class SlackHelper {
    static sendDelayedResponse(response_url, post_data, callback) {
        console.log('sending delayed response: ', post_data);

        if (!response_url) {
            callback('response_url coudn\'t be empty');
            return;
        }

        const options = {
            hostname: 'hooks.slack.com',
            port: 443,
            path: response_url.split('.com')[1],
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': post_data.length
            }
        };

        const req = https.request(options, (res) => { });

        req.on('error', (error) =>
            callback(null, new SlackMessageBuilder()
                .setText(`error: ${error}`)
                .asEphemeral()
                .get()
            )
        );

        req.write(post_data);
        req.end();
    }
}
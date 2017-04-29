export default class SlackMessageBuilder {

    constructor() {
        this._message = {};
    }

    setText(text) {
        this._message.text = text;
        return this;
    }

    asEphemeral() {
        this._message.response_type = 'ephemeral';
        return this;
    }

    asInChannel() {
        this._message.response_type = 'in_channel';
        return this;
    }

    appendAttachment(attachment) {
        if (!this._message.attachments) {
            this._message.attachments = [];
        }
        this._message.attachments.push({ text: attachment });
        return this;
    }

    get() {
        return this._message;
    }
}
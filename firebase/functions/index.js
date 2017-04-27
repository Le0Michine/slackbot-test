var functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.getTFSItemLinkById = functions.https.onRequest((request, response) => {
    const id = request.query.id;
    const { token, text, team_id, response_url } = request.body;
    console.log(`called with ${JSON.stringify(request.body)}`);
    const ids = text.split(/[., ]/).map(x => +x).filter(x => !!x);

    if (!text || /^ *$/.test(text) || !ids.length) {
        response.send({ response_type: "ephemeral", text: "you should pass comma separated list of tfs item ids" });

        return;
    }

    admin.database().ref('/tfs').child(team_id).on('value', snapshot => {
        const tfsUrl = snapshot.val() ? snapshot.val().url : '';
        const ref = ids.map(x => `<${tfsUrl}${x}|Item ${x}>`).join(', ');
        response.send({ response_type: "in_channel", text: ref });
    }, errorObject => {
        response.send({ response_type: "ephemeral", text: JSON.stringify(errorObject) });
    });
});

exports.setTFSBaseURL = functions.https.onRequest((request, response) => {
    const { token, text, team_id, response_url } = request.body;
    admin.database().ref('/tfs').child(team_id).set({ url: text }).then(snapshot => {
        response.send({ response_type: "in_channel", text: "Done, new url", attachments: [ { text: `<${text}>` } ] });
    });
});

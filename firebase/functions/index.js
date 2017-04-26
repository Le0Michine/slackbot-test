var functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.getTFSItemLinkById = functions.https.onRequest((request, response) => {
    const id = request.query.id;
    const { token, text, team_id } = request.body;

    admin.database().ref('/tfs').child(team_id).on('value', snapshot => {
        const tfsUrl = snapshot.val() ? snapshot.val().url : '';
        const ref = `<${tfsUrl}${text}|Item ${text}>`;
        response.send({ text: ref });
    }, errorObject => {
        response.send(id);
    });
});

exports.setTFSBaseURL = functions.https.onRequest((request, response) => {
    const { token, text, team_id } = request.body;
    admin.database().ref('/tfs').child(team_id).set({ url: text }).then(snapshot => {
        response.send("done");
    });
});

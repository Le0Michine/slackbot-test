import AWS from 'aws-sdk';
const dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
const tableName = 'slack-app';

export default class DynamoDBHelper {
    static putItem(team_id, team_domain, command, link) {
        dynamodb.listTables(function (err, data) {
            console.log(JSON.stringify(data, null, '  '));
        });
        const datetime = new Date().getTime().toString();
        return new Promise((resolve, reject) => {
            dynamodb.putItem({
                TableName: tableName,
                Item: {
                    team_id: { S: team_id },
                    team_domain: { S: team_domain },
                    command: { S: command },
                    link: { S: link },
                    timestamp: { S: datetime }
                }
            }, (err, data) => {
                if (err) {
                    console.log('error', 'putting item into dynamodb failed: ' + err);
                    reject(err);
                }
                else {
                    console.log('great success: ' + JSON.stringify(data, null, '  '));
                    resolve(link);
                }
            });
        });
    }

    static getLink(team_id, team_domain, command) {
        const params = {
            TableName: 'slack-app',
            ProjectionExpression: 'link',
            KeyConditionExpression: 'team_id = :v1 AND command = :v2',
            ExpressionAttributeValues: {
                ':v1': { S: team_id },
                ':v2': { S: command },
            }
        };
        return new Promise(
            (resolve, reject) => {
                dynamodb.query(params, (err, data) => {
                    if (err) {
                        console.log('error', 'getting item from dynamodb failed: ' + err);
                        reject(err);
                    } else {
                        console.log('great success: ' + JSON.stringify(data, null, '  '));
                        if (data.Count) {
                            const link = data.Items.map(x => x.link.S)[0];
                            console.log('returning link', link);
                            resolve(link);
                        } else {
                            console.log('no link found');
                            reject('no link found');
                        }
                    }
                });
            }
        );
    }
}
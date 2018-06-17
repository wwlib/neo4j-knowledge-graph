import DialogflowControllerV1 from './DialogflowControllerV1';
import DialogflowControllerV2 from './DialogflowControllerV2';

const program = require('commander');
const prettyjson = require('prettyjson');

// let dialogflowControllerV1 = new DialogflowController();
let dialogflowControllerV2 = new DialogflowControllerV2();

program
.version('0.0.1')
.description('An application for testing dialogflow requests')
.option('-q, --query <query>', 'The query to test')
.option('-c, --context <context>')
.parse(process.argv);

let query: string = 'do you like penguins';
let languageCode: string = 'en-US';
let context: string = undefined;
let contexts: string[] = undefined;

if (program.query) {
    console.log(program.query);
    query = program.query;
}

if (program.context) {
    console.log(program.context);
    context = program.context;
    contexts = [program.context];
}

let sessionId: string = `${Math.floor(Math.random()*10000)}`;

// V1

// let latitude: string = '42.361145';
// let longitude: string = '-71.057083';
// let timezone: string = 'America/New_York';
//
// latitude = program.lat ? program.lat : latitude;
// longitude = program.long ? program.long : longitude;
// sessionId = program.robot ? program.robot : sessionId;
// timezone = program.tz ? program.tz : timezone;

// dialogflowControllerV1.call(query, latitude, longitude, sessionId, timezone, contexts)
//     .then((response: string) => {
//         console.log(prettyjson.render(response, {}));
//     })
//     .catch((err: any) => {
//         console.log(`ERROR: dialogflowController\n`, err)
//     });

// V2

dialogflowControllerV2.call(query, languageCode, context, sessionId)
    .then((result: any) => {
        console.log(prettyjson.render(result, {}));
    })
    .catch((err: any) => {
        console.log(`ERROR: dialogflowController\n`, err)
    });

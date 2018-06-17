import LUISController from './LUISController';

const program = require('commander');
const prettyjson = require('prettyjson');

let luisController = new LUISController();

program
.version('0.0.1')
.description('An application for testing LUIS requests')
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

luisController.call(query)
    .then((result: any) => {
        console.log(prettyjson.render(result, {}));
    })
    .catch((err: any) => {
        console.log(`ERROR: LUISController\n`, err)
    });

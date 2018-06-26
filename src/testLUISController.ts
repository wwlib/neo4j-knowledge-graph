import LUISController from './LUISController';

const program = require('commander');
const prettyjson = require('prettyjson');

let luisController = new LUISController();

program
.version('0.0.1')
.description('An application for testing LUIS requests')
.option('-q, --query <query>', 'The query to test')
.parse(process.argv);

let query: string = 'do you like penguins';

if (program.query) {
    console.log(program.query);
    query = program.query;
}

luisController.call(query)
    .then((result: any) => {
        console.log(prettyjson.render(result, {}));
    })
    .catch((err: any) => {
        console.log(`ERROR: LUISController\n`, err)
    });

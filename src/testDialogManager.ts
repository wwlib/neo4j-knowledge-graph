import DialogManager from './DialogManager';
const program = require('commander');

program
.version('0.0.1')
.description('An application for testing the DialogManager class')
.option('-q, --query <query>', 'The query to test')
.option('-c, --context <context>')
.option('-n, --nlu <nlu>', 'luis, dialogflow, dialogflowV1')
.parse(process.argv);

let context: string = 'launch';
let contexts: string[] = [context];
let query: string = 'do you like penguins';
let nluType: string = 'luis';

if (program.context) {
    contexts = [program.context];
}
if (program.query) {
    // console.log(program.query);
    query = program.query;
}
if (program.nlu) {
    nluType = program.nlu;
}

const dialogManager = new DialogManager({debug: true, nluType: nluType});

dialogManager.ask(query, context)
.then((result: string) => {
    console.log(`result:\n`, result);
})
.catch((err: any) => {
    console.log(`error:\n`, err);
});

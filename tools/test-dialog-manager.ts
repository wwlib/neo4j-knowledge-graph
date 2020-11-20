import  DialogManager from '../src/DialogManager';
const program = require('commander');

program
.version('0.0.1')
.description('An application for testing the DialogManager class')
.option('-q, --query <query>', 'The query to test')
.option('-c, --context <context>')
.option('-n, --nlu <nlu>', 'node-nlp, luis')
.parse(process.argv);

let context: string = 'launch';
let contexts: string[] = [context];
let query: string = 'do you like penguins';
let nluType: string = 'node-nlp';

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

const dialogManager = new DialogManager();
dialogManager.init({debug: true, nluType: nluType})
.then(() => {
    dialogManager.ask(query, context)
    .then((result: string) => {
        console.log(`result:\n`, result);
    })
    .catch((err: any) => {
        console.log(`error:\n`, err);
    });
});

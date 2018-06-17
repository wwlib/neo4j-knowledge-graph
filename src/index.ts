const program = require('commander');
const inquirer = require('inquirer');
const Rx = require('rx');
const prettyjson = require('prettyjson');

import DialogManager from './DialogManager';

let dialogManager: DialogManager;

program
.version('0.0.1')
.description('An application testing dialog interactions')
.option('-d, --debug', 'Turn on debug messages')
.option('-c, --context <context>')
.option('-r, --reset', 'Reset the loop')
.parse(process.argv);

let context: string = 'launch'
let contexts: string[] = [context];

if (program.debug) {
    dialogManager = new DialogManager({debug: true});
} else {
    dialogManager = new DialogManager({debug: false});
}

if (program.context) {
    context = program.context;
    contexts = [program.context];
}

if (program.reset) {
    console.log('>>>Cleaning up loop nodes');
    let cleanLoop_Cypher = 'match (n:LoopMember)-[r:LIKES]->() delete n, r'
    dialogManager.deleteUsers();
}

var questions = [
  {
    type: 'input',
    name: 'query',
    message: 'Enter a query: ',
    default: 'match (n) return n'
  }
];

const prompts = new Rx.Subject();
let i = 0;

function makePrompt(msg: any) {
  let prompt: string = '';
    return {
      type: 'input',
      name: `userInput-${i}`,
      message: `${msg || 'Ask a do-you-like question or say "[user] likes [something]".'}\n`,
    };
}

inquirer.prompt(prompts).ui.process.subscribe((result: any) => {
  if (result && result.answer !== '') {
    i += 1;
    dialogManager.ask(result.answer, context)
        .then((result: string) => {
          prompts.onNext(makePrompt(result));
        })
        .catch(() => {
            prompts.onNext(makePrompt('Please try that again.'));
        });
  } else {
    prompts.onCompleted();
  }
}, (err: any) => {
  console.warn(err);
}, () => {
  console.log('Interactive session is complete. Good bye! 👋\n');
});

prompts.onNext(makePrompt(''));

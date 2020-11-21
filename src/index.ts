import DialogManager from './DialogManager';

const path = require('path');
const jsonfile = require('jsonfile');
const program = require('commander');
const inquirer = require('inquirer');

const configPath = path.resolve('data/config.json');
    let config: any;
    try {
        config= jsonfile.readFileSync(configPath);
    } catch (error) {
        console.error(`Error: data/config.json not found.`);
        process.exit(0);
    }

let dialogManager: DialogManager;

program
  .version('0.0.1')
  .description('An application testing dialog interactions')
  .option('-d, --debug', 'Turn on debug messages')
  .option('-c, --context <context>')
  .option('-r, --reset', 'Reset Users')
  .parse(process.argv);

let context: string = 'launch'
let contexts: string[] = [context];

if (program.context) {
  context = program.context;
  contexts = [program.context];
}

dialogManager = new DialogManager();
dialogManager.init({ debug: program.debug, config: config })
  .then(() => {
    if (program.reset) {
      console.log('>>>Cleaning up User nodes');
      dialogManager.deleteUsers();
    }
    console.log(`Ask a do-you-like question or say "[user] likes [something]".`)
    mainPromptLoop('>');
  });

function mainPrompt(input: string) {
  let result: any = input;
  if (typeof input === 'string') {
    result = {
      type: 'command',
      name: 'mainInput',
      message: `${input}`,
    };
  }
  return result;
}

function mainPromptLoop(msg: string) {
  inquirer.prompt(mainPrompt(msg)).then((answers: any) => {
    const input = answers.mainInput;
    if (input === 'quit' || input === 'bye' || input === 'exit' || input === 'x' || input === 'q') {
      console.log('bye');
      process.exit(0);
    } else {
      dialogManager.ask(input, context)
        .then((result: string) => {
          console.log(`${result}`);
          mainPromptLoop('>');
        })
        .catch(() => {
          mainPromptLoop('Please try that again >');
        });
    }
  })
    .catch((error: any) => {
      console.log(error);
      process.exit(0);
    });
}

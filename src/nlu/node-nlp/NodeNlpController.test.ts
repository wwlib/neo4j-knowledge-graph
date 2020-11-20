import NodeNlpController from './NodeNlpController';
import { NLUIntentAndEntities } from '../NLUController';

let nodeNlpController: NodeNlpController;

// Note: To regenerate the current model, delete (or rename) ../../../data/model.nlp

test('NodeNlpController: instantiate and ready', async () => {
  nodeNlpController = new NodeNlpController();
  await nodeNlpController.init();
  expect(nodeNlpController.ready).toBeTruthy;
});

test('NodeNlpController: parse intent: launchUserLikes', async () => {
  nodeNlpController.getIntentAndEntities('Andrew likes penguins')
    .then((result: NLUIntentAndEntities) => {
      expect(result.intent).toEqual('launchUserLikes');
    });
});

  /*
  {
    intent: 'launchUserLikes',
    entities:
    {
      user: 'Andrew',
      userOriginal: 'Andrew',
      thing: 'Penguins',
      thingOriginal: 'penguins',
      entities: [[Object], [Object]]
    }
  }
  */

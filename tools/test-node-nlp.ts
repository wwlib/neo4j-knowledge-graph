const { NlpManager } = require('node-nlp');

const manager = new NlpManager({ languages: ['en'] });
manager.addNamedEntityText(
    'hero',
    'spiderman',
    ['en'],
    ['Spiderman', 'Spider-man'],
);
manager.addNamedEntityText(
    'hero',
    'iron man',
    ['en'],
    ['iron man', 'iron-man'],
);
manager.addNamedEntityText('hero', 'thor', ['en'], ['Thor']);
manager.addNamedEntityText(
    'food',
    'burguer',
    ['en'],
    ['Burguer', 'Hamburguer'],
);
manager.addNamedEntityText('food', 'pizza', ['en'], ['pizza']);
manager.addNamedEntityText('food', 'pasta', ['en'], ['Pasta', 'spaghetti']);
manager.addDocument('en', 'I saw %hero% eating %food%', 'sawhero');
manager.addDocument(
    'en',
    'I have seen %hero%, he was eating %food%',
    'sawhero',
);
manager.addDocument('en', 'I want to eat %food%', 'wanteat');
manager.train()
    .then(() => {
        manager
            .process('I saw spiderman eating spaghetti today in the city!')
            .then((result: any) => console.log(result));
    });

// { locale: 'en',
//   localeIso2: 'en',
//   language: 'English',
//   utterance: 'I saw spiderman eating spaghetti today in the city!',
//   classification:
//    [ { label: 'sawhero', value: 0.9920519933583061 },
//      { label: 'wanteat', value: 0.00794800664169383 } ],
//   intent: 'sawhero',
//   score: 0.9920519933583061,
//   entities:
//    [ { start: 6,
//        end: 15,
//        levenshtein: 0,
//        accuracy: 1,
//        option: 'spiderman',
//        sourceText: 'Spiderman',
//        entity: 'hero',
//        utteranceText: 'spiderman' },
//      { start: 23,
//        end: 32,
//        levenshtein: 0,
//        accuracy: 1,
//        option: 'pasta',
//        sourceText: 'spaghetti',
//        entity: 'food',
//        utteranceText: 'spaghetti' } ],
//   sentiment:
//    { score: 0.708,
//      comparative: 0.07866666666666666,
//      vote: 'positive',
//      numWords: 9,
//      numHits: 2,
//      type: 'senticon',
//      language: 'en' } }
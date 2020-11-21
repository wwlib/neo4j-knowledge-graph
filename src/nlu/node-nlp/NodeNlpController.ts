import NLUController, { NLUControllerOptions, NLUIntentAndEntities, NLURequestOptions, NLULanguageCode } from '../NLUController';

const path = require('path');
const { NlpManager } = require('node-nlp');

export type NodeNlpIntent = {
    intent: string;
    score: number;
};

export type NodeNlpEntity = {
    start: number;
    end: number;
    len: number;
    accuracy: number;
    entity: string;
    type: string;
    option: string;
    sourceText: string;
    utteranceText: string;
    resolution: any;
}

export type NodeNlpClassification = {
    intent: string;
    score: number;
}

export type NodeNlpSentiment = {
    score: number;
    numWords: number;
    numHits: number;
    average: number;
    type: string;
    locale: string;
    vote: string;
}

export type NodeNlpResponse = {
    locale: string;
    utterance: string;
    languageGuessed: boolean;
    localeIso2: string;
    language: string;
    classifications: NodeNlpClassification[];
    intent: string;
    score: number;
    domain: string;
    sourceEntities: string[];
    entities: NodeNlpEntity[];
    answers: string[];
    answer: undefined;
    actions: string[];
    sentiment: NodeNlpSentiment;
}

export default class NodeNlpController extends NLUController {

    private _classifier: any;
    private _ready: boolean;

    /**
     * @constructor
     */
    constructor(options: NLUControllerOptions = {}) {
        super(options);
        this._ready = false;
    }

    get ready(): boolean {
        return this._ready;
    }

    get classifier(): any {
        return this._classifier;
    }

    set config(config: any) {
        if (config) {
            // 
        } else {
            //
        }
    }

    async init(modelPath: string = '') {
        this._classifier = new NlpManager({ languages: ['en'], autoSave: false, nlu: { log: false } });
        if (modelPath) {
            let inputPath: string = path.resolve(modelPath); // (__dirname, '../../../data/model.nlp');
            if (this._debug) {
                console.info(`NodeNlpController: init: loading: ${inputPath}`);
            }
            try {
                this._classifier.load(inputPath);
                this._ready = true;
            } catch (err) {
                if (this._debug) {
                    console.info(`NodeNlpController: init: model NOT FOUND: ${inputPath}`);
                }
            }
        }
        if (!this._ready) {
            if (this._debug) {
                console.info(`NodeNlpController: generating model...`);
            }
            await this.generateModel();
            this._ready = true;
        }
    }

    generateModel(outputPath: string = '') {
        if (this._debug) {
            console.info(`NodeNlpController: generateModel: outputPath: ${outputPath}`);
        }
        return new Promise(async (resolve, reject) => {

            this._classifier.addNamedEntityText('user', 'Andrew', ['en'], ['Andrew', 'andrew', 'andy']);
            this._classifier.addNamedEntityText('user', 'Robert', ['en'], ['Robert', 'robert', 'bob']);
            this._classifier.addNamedEntityText('user', 'Jane', ['en'], ['Jane', 'jane']);
            this._classifier.addNamedEntityText('user', 'Eric', ['en'], ['Rick', 'rick', 'eric']);
            this._classifier.addNamedEntityText('user', 'Cynthia', ['en'], ['Cynthia', 'cynthia']);

            this._classifier.addNamedEntityText('thing', 'Penguin', ['en'], ['Penguins', 'penguins', 'penguin']);
            this._classifier.addNamedEntityText('thing', 'Mammal', ['en'], ['Mammals', 'mammals', 'mammal']);
            this._classifier.addNamedEntityText('thing', 'Bird', ['en'], ['Birds', 'birds', 'bird']);
            this._classifier.addNamedEntityText('thing', 'Whale', ['en'], ['Whales', 'whales', 'whale']);

            this._classifier.addNamedEntityText('thing', 'Albatross', ['en'], ['Albatrosses', 'albatross']);
            this._classifier.addNamedEntityText('thing', 'Armadillo', ['en'], ['Armadillos', 'armadillo']);
            this._classifier.addNamedEntityText('thing', 'Flamingo', ['en'], ['Flamingos', 'flamingo']);
            this._classifier.addNamedEntityText('thing', 'Fly', ['en'], ['Flies', 'fly']);
            this._classifier.addNamedEntityText('thing', 'Zebra', ['en'], ['Zebras', 'zebra']);
            this._classifier.addNamedEntityText('thing', 'Mammal', ['en'], ['Mammals', 'mammal']);
            this._classifier.addNamedEntityText('thing', 'Bird', ['en'], ['Birds', 'bird']);
            this._classifier.addNamedEntityText('thing', 'Bat', ['en'], ['Bats', 'bat']);
            this._classifier.addNamedEntityText('thing', 'Insect', ['en'], ['Insects', 'insect']);
            this._classifier.addNamedEntityText('thing', 'Butterfly', ['en'], ['Butterflies', 'butterfly']);
            this._classifier.addNamedEntityText('thing', 'Vertebrate', ['en'], ['Vertebrates', 'vertebrate']);
            this._classifier.addNamedEntityText('thing', 'Animal', ['en'], ['Animals', 'animal']);
            this._classifier.addNamedEntityText('thing', 'Invertebrate', ['en'], ['Invertebrates', 'invertebrate']);

            this._classifier.addDocument('en', "%user% likes %thing%", 'launchUserLikes');
            this._classifier.addDocument('en', "do you like %thing%", 'launchDoYouLike');

            await this._classifier.train();
            if (!outputPath) {
                outputPath = path.resolve(__dirname, '../../../data/model-new.nlp');
                if (this._debug) {
                    console.info(`No model outputPath specified. Using: ${outputPath}`);
                }
            }
            this._classifier.save(outputPath);
            resolve(outputPath);
        });
    }

    call(query: string): Promise<NodeNlpResponse> {
        return new Promise<NodeNlpResponse>(async (resolve, reject) => {
            const response: NodeNlpResponse = await this._classifier.process(query);
            resolve(response);
        });
    }

    getEntitiesWithResponse(response: NodeNlpResponse): any {
        let entitiesObject: any = {
            user: 'Someone',
            userOriginal: 'Someone',
            thing: 'that',
            thingOriginal: 'that',
            entities: undefined
        };

        if (response && response.entities) {
            entitiesObject.entities = response.entities;
            response.entities.forEach((entity: NodeNlpEntity) => {
                if (entity.entity === 'user') {
                    const user: string = entity.option || entity.utteranceText;
                    entitiesObject.user = user;
                    entitiesObject.userOriginal = entity.utteranceText;
                } else if (entity.entity === 'thing') {
                    const thing: string = entity.option || entity.utteranceText;
                    entitiesObject.thing = thing;
                    entitiesObject.thingOriginal = entity.utteranceText;
                }
            });
        }
        return entitiesObject;
    }

    getIntentAndEntities(utterance: string, options?: NLURequestOptions): Promise<NLUIntentAndEntities> {
        options = options || {};
        let defaultOptions: NLURequestOptions = {
            languageCode: NLULanguageCode.en_US,
            contexts: undefined,
            sessionId: undefined
        }
        options = Object.assign(defaultOptions, options);

        return new Promise<NLUIntentAndEntities>((resolve, reject) => {
            let intentAndEntities: NLUIntentAndEntities = {
                intent: '',
                intents: undefined,
                entities: undefined,
                response: undefined
            }
            if (this._ready && utterance) {
                this.call(utterance)
                    .then((response: NodeNlpResponse) => {
                        if (response && response.intent) {
                            intentAndEntities = {
                                intent: response.intent,
                                intents: undefined,
                                entities: this.getEntitiesWithResponse(response),
                                response: response,
                            }
                        }
                        resolve(intentAndEntities);
                    })
                    .catch((err: any) => {
                        reject(err);
                    });
            } else {
                resolve(intentAndEntities);
            }

        });
    }
}

import NLUController, {
    NLURequestOptions,
    NLUIntentAndEntities
} from './nlu/NLUController';

import NodeNlpController from './nlu/node-nlp/NodeNlpController';
import LUISController from './nlu/microsoft/LUISController';

import Neo4jController from './neo4j/Neo4jController';

import { d3Types } from './d3/d3Types';

const prettyjson = require('prettyjson');

export default class DialogManager {

    public neo4jController: Neo4jController;
    public nluController: NLUController;
    public sessionId: string = `robot_${Math.floor(Math.random() * 10000)}`;
    public languageCode: string = 'en-US';

    private _debug: boolean = false;

    constructor() {
        
    }

    async init(options: any = {}) {
        if (options.debug) {
            this._debug = true;
        }
        if (options.nluType === 'luis') {
            this.nluController = new LUISController({ debug: this._debug });
        } else {
            this.nluController = new NodeNlpController({ debug: this._debug });
            await this.nluController.init();
        }
        this.neo4jController = new Neo4jController({ debug: this._debug });
    }

    ask(question: string, context?: string): Promise<any> {
        return new Promise((resolve, reject) => {
            const options: NLURequestOptions = {
                languageCode: this.languageCode,
                contexts: [context],
                sessionId: this.sessionId
            }
            this.nluController.getIntentAndEntities(question, options)
                .then((intentAndEntities: NLUIntentAndEntities) => {
                    this.handleNLUIntentAndEntities(intentAndEntities)
                        .then((answer) => {
                            resolve(answer);
                        })
                        .catch((err: any) => {
                            reject(err);
                        });
                })
                .catch((err: any) => {
                    reject(err);
                });
        });
    }

    handleNLUIntentAndEntities(intentAndEntities: NLUIntentAndEntities): Promise<any> {
        return new Promise((resolve, reject) => {
            let intent: string = intentAndEntities.intent;
            let entities: any = intentAndEntities.entities;
            let answer: string;

            this.debug(prettyjson.render(intentAndEntities, {}));

            if (intent == 'launchDoYouLike') {
                console.log(`INTENT: launchDoYouLike`);
                let cypher: string = `match (a {name:'${entities.thing}'})<-[:LIKES]-(j:Robot {name:'global'}) return a`;
                this.debug(`  STEP 1a: SEE IF THE ROBOT LIKES THAT NODE ALREADY...`)
                this.debug(`    cypher: ${cypher}`);
                this.neo4jController.parseCypherWithD3Helper(cypher)
                    .then((data: d3Types.d3Graph) => {
                        this.debug(`    cypher result:`, data);
                        if (data.nodes.length == 1) {   // when successful, there will be one matching node as long as the entity names are unique
                            let node: d3Types.d3Node = data.nodes[0];
                            let scriptedResponse: string = node.properties['RobotLikes'];
                            answer = scriptedResponse ? scriptedResponse : `Yes, I do like ${entities.thingOriginal} very much.`;

                            cypher = `match ({name:'${entities.thing}'})<-[:LIKES]-(user:User) return user`;
                            this.debug(`  STEP 1a: SEE IF THERE IS A USER THAT ALSO LIKES THAT NODE...`)
                            this.debug(`    cypher: ${cypher}`);
                            this.neo4jController.parseCypherWithD3Helper(cypher)
                                .then((data: d3Types.d3Graph) => {
                                    this.debug(`    cypher result:`, data);
                                    if (data.nodes.length > 0) {
                                        answer += this.generateListWithPhrases(data.nodes, '...and I know that', 'likes them too.', 'like them too.');
                                    }
                                    resolve(answer);
                                })
                                .catch(() => {
                                    reject();
                                });
                        } else {
                            let cypher = `match(v {name:'${entities.thing}'})<-[:IS_A *]-(p)<-[l:LIKES]-(j:Robot {name:'global'}) return p`;
                            this.debug(`  STEP 2: SEE IF THERE ARE DESCENDANTS OF THAT NODE LIKED BY THE ROBOT...`)
                            this.debug(`    cypher: ${cypher}`);
                            this.neo4jController.parseCypherWithD3Helper(cypher)
                                .then((data: d3Types.d3Graph) => {
                                    this.debug(`    cypher result:`, data);
                                    let nodes: d3Types.d3Node[] = data.nodes;
                                    if (nodes.length > 1) {
                                        answer = `Yes I like many ${entities.thingOriginal} and in particular i love`;
                                        answer += this.pluralList(nodes);
                                        resolve(answer);
                                    } else if (nodes.length == 1) {
                                        let node: d3Types.d3Node = nodes[0];
                                        answer = `Yes, of all the ${entities.thingOriginal} i like ${this.getPluralNameWithNode(node)}.`;
                                        resolve(answer);
                                    } else { // try upward inference
                                        cypher = `match (a {name:'${entities.thing}'})-[:IS_A]->(b) with b match (b)<-[:IS_A *]-(p)<-[:LIKES]-(j:Robot {name:'global'}) return b, p`
                                        this.debug(`  STEP 3: TRY AN UPWARD REFERENCE...`)
                                        this.debug(`    cypher: ${cypher}`);
                                        this.neo4jController.parseCypherWithD3Helper(cypher)
                                            .then((data: d3Types.d3Graph) => {
                                                this.debug(`    cypher result:`, data);
                                                answer = `Actually I don't know if I like ${entities.thingOriginal}.`;
                                                let nodes: d3Types.d3Node[] = data.nodes;
                                                if (nodes.length > 1) { // the first node will be the parent and its children will be other instances of that type
                                                    let parentNode: d3Types.d3Node = nodes.shift();
                                                    answer = `I don't know if I like ${entities.thingOriginal} but they are ${this.getPluralNameWithNode(parentNode)}`;
                                                    answer = `${answer} and I do like ${this.getPluralNameWithNode(parentNode)}. Of all the ${this.getPluralNameWithNode(parentNode)}`;
                                                    answer = `${answer} I like`;
                                                    if (nodes.length > 1) {
                                                        answer += this.pluralList(nodes);
                                                    } else {
                                                        answer = `${answer} ${this.getPluralNameWithNode(nodes[0])}.`;
                                                    }
                                                }
                                                resolve(answer);
                                            })
                                            .catch(() => {
                                                reject();
                                            });
                                    }
                                });
                        }
                    })
                    .catch((error: any) => {
                        console.error(error);
                        reject(error);
                    });

            } else if (intent == 'launchUserLikes') {
                let answer = `OK. I understand that ${entities.user} likes ${entities.thingOriginal}. That's cool!`;

                let cypher = `merge (user:User {name:'${entities.user}'})`;
                this.debug(`  STEP 1: CREATE USER NODE IF IT DOES NOT EXIST YET...`)
                this.debug(`    cypher: ${cypher}`);
                this.neo4jController.call(cypher)
                    .then((data: any) => {
                        // Make a LIKE relationship
                        cypher = `match (like {name:'${entities.thing}'}) with like match(user:User {name:'${entities.user}'}) with like, user merge (user)-[:LIKES]->(like)`;
                        this.debug(`  STEP 1a: CREATE A LIKE RELATIONSHIP...`)
                        this.debug(`    cypher: ${cypher}`);
                        this.neo4jController.call(cypher)
                            .then((data: any) => {
                                resolve(answer);
                            })
                            .catch(() => {
                                reject();
                            });
                    })
                    .catch(() => {
                        reject();
                    });
            } else {
                reject();
            }
        });
    }

    getPluralNameWithNode(node: d3Types.d3Node): string {
        let result: string = `${node.properties.name}s`;
        if (node.properties.plural) {
            result = node.properties.plural;
        }
        return result;
    }

    pluralList(nodes: d3Types.d3Node[]): string {
        let result: string = '';
        for (let i: number = 0; i < (nodes.length - 1); i++) {
            let node = nodes[i];
            result += ` ${this.getPluralNameWithNode(node)}`;
            if (nodes.length > 2) {
                result += ','
            }
        };
        result += ` and ${this.getPluralNameWithNode(nodes[nodes.length - 1])}.`
        return result;
    }

    generateListWithPhrases(nodes: d3Types.d3Node[], introPhrase: string = '', singularPhrase: string = '', pluralPhrase: string = ''): string {
        let result: string = '';
        if (nodes.length > 0) {
            result += introPhrase;
            if (nodes.length == 1) {
                result += ` ${nodes[0].properties['name']} ${singularPhrase}`;
            } else {
                for (let i: number = 0; i < (nodes.length - 1); i++) {
                    let node = nodes[i];
                    result += ` ${node.properties['name']}`;
                    if (nodes.length > 2) {
                        result += ',';
                    }
                };
                result += ` and ${nodes[nodes.length - 1].properties['name']}`;
                result += ` ${pluralPhrase}`;
            }
        }
        return result;
    }

    deleteUsers(): Promise<void> {
        return new Promise((resolve, reject) => {
            let cypher: string = `match (n:User)-[r:LIKES]->() delete n, r`;
            this.neo4jController.call(cypher)
                .then(() => {
                    this.debug(`The User nodes have been deleted.`);
                    resolve();
                });
        });
    }

    debug(text: string, object?: any): void {
        if (this._debug) {
            if (text && object) {
                console.log(text, object);
            } else {
                console.log(text);
            }
        }
    }
}

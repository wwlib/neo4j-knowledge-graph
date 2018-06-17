// https://github.com/dialogflow/dialogflow-nodejs-client-v2
// https://medium.com/@tzahi/how-to-setup-dialogflow-v2-authentication-programmatically-with-node-js-b37fa4815d89
// https://dialogflow.com/docs/reference/v1-v2-mapping
// https://github.com/dialogflow/dialogflow-nodejs-client-v2/issues/64

import NLUController, {
    NLUIntentAndEntities
} from './NLUController';

const dialogflow = require('dialogflow');

const dialogFlowConfig: any = require('../data/Dialogflow-config.json');

export type DialogflowQueryInput = {
    text: {
        text: string;
        languageCode: string;
    }
}

export type DialogflowRequest = {
    session: any;
    queryInput: DialogflowQueryInput;
    queryParams?: any;
}

export type DialogflowOutputContext = {
    name: string;
    lifespanCount: number;
    parameters: {
        fields: any
    }
}

export type DialogflowResponse = {
    fulfillmentMessages: any;
    outputContexts: any;
    queryText: string;
    speechRecognitionConfidence: number;
    action: string;
    parameters: any;
    allRequiredParamsPresent: boolean;
    fulfillmentText: string;
    webhookSource: string;
    webhookPayload: any;
    intent: any;
    intentDetectionConfidence: number;
    diagnosticInfo: any;
    languageCode: string;
}

export default class DialogflowControllerV2 extends NLUController {

  public projectId = dialogFlowConfig.projectId; //https://dialogflow.com/docs/agents#settings
  public sessionId = 'quickstart-session-id';

  // Instantiate a Dialogflow client.
  public sessionClient: any;

  // Define session path
  public sessionPath: any;

  constructor() {
    super();
    let config: any = {
        credentials: {
            private_key: dialogFlowConfig.privateKey,
            client_email: dialogFlowConfig.clientEmail
        }
    }
    // console.log(`DialogflowControllerV2: constructor: config:`, config);
    this.sessionClient = new dialogflow.SessionsClient(config);
    // console.log(this.sessionClient);
  }

  call(query: string, languageCode: string, context: string, sessionId?: string): Promise<any> {
      // console.log(`DialogflowControllerV2: call: `, query, languageCode, sessionId);
      sessionId = sessionId || this.sessionId;
      this.sessionPath = this.sessionClient.sessionPath(this.projectId, sessionId);
      // Send request and log result
      let request: DialogflowRequest = {
          session: this.sessionPath,
          queryInput: {
              text: {
                  text: query,
                  languageCode: languageCode,
              },
          }
      };

      let contextObject: any;
      if (context) {
          contextObject = {
              name: `${this.sessionPath}/contexts/${context}`,
              lifespanCount: 5
          };
          request.queryParams = {
              contexts: [
                  contextObject
              ]
          }
      }
      // console.log(`DialogflowControllerV2: call: request: `, contextObject, request);
      return new Promise((resolve, reject) => {
          this.sessionClient
            .detectIntent(request)
            .then((responses: any[]) => {
              // console.log('Detected intent');
              const result = responses[0].queryResult;
              // console.log(`  Query: ${result.queryText}`);
              // console.log(`  Response: ${result.fulfillmentText}`);
              // if (result.intent) {
              //   console.log(`  Intent: ${result.intent.displayName}`);
              // } else {
              //   console.log(`  No intent matched.`);
              // }
              resolve(result);
            })
            .catch((err: any) => {
              // console.error('ERROR:', err);
              reject(err);
            });
        });
  }

  getFieldStringValue(field: any, defaultValue: string): string {
      let result: string = defaultValue;
      if (field && field.kind && (field.kind === 'stringValue') && field.stringValue) {
          result = field.stringValue;
      }
      return result;
  }

  getEntitiesWithResponse(response: DialogflowResponse): any {
      let entitiesObject: any = {
          user: 'Someone',
          userOriginal: 'Someone',
          thing: 'that',
          thingOriginal: 'that'
      };

      let fields;
      if (response && response.outputContexts && response.outputContexts[0] && response.outputContexts[0].parameters && response.outputContexts[0].parameters.fields) {
          fields = response.outputContexts[0].parameters.fields;
          if (fields) {
              entitiesObject.user = this.getFieldStringValue(fields['user'], entitiesObject.user);
              entitiesObject.userOriginal = this.getFieldStringValue(fields['user.original'], entitiesObject.userOriginal);
              entitiesObject.thing = this.getFieldStringValue(fields['thing'], entitiesObject.thing);
              entitiesObject.thingOriginal = this.getFieldStringValue(fields['thing.original'], entitiesObject.thingOriginal);
          }
      } else if (response && response.parameters && response.parameters.fields) {
          fields = response.parameters.fields
          entitiesObject.thing = this.getFieldStringValue(fields['thing'], entitiesObject.thing);
          entitiesObject.thingOriginal = this.getFieldStringValue(fields['thing'], entitiesObject.thingOriginal);
      }

      return entitiesObject;
  }

  getIntentAndEntities(query: string, languageCode: string, context: string, sessionId?: string): Promise<NLUIntentAndEntities> {
      return new Promise((resolve, reject) => {
          this.call(query, languageCode, context, sessionId)
              .then((response: DialogflowResponse) => {
                  let intentAndEntities: NLUIntentAndEntities = {
                      intent: response.intent.displayName,
                      entities: this.getEntitiesWithResponse(response)
                  }
                  resolve(intentAndEntities);
              })
              .catch((err: any) => {
                  reject(err);
              })
      })
  }


}

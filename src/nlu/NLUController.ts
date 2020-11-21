export type NLUIntentAndEntities = {
  intent: string;
  intents: any;
  entities: any;
  response: any;
}

export type NLURequestOptions = {
  languageCode?: string;
  contexts?: string[];
  sessionId?: string;
}

export enum NLULanguageCode {
  en_US = 'en-US'
}

export type NLUControllerOptions = {
  config?: any;
  debug?: boolean;
}

export default abstract class NLUController {

  protected _debug: boolean;

  constructor(options: NLUControllerOptions = {}) {
    this._debug = false;
    if (options.debug) {
      this._debug = true;
    }
  }

  abstract init(): Promise<any>;

  abstract set config(config: any);

  abstract call(query: string, languageCode: string, context: string, sessionId?: string): Promise<any>;

  abstract getEntitiesWithResponse(response: any): any | undefined;

  abstract getIntentAndEntities(utterance: string, options?: NLURequestOptions): Promise<NLUIntentAndEntities>;  
}

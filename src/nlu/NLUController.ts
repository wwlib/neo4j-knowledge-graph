export type NLUIntentAndEntities = {
    intent: string;
    entities: any;
    response?: any;
}

export type NLURequestOptions = {
  languageCode?: string;
  contexts?: string[];
  sessionId?: string;
}

export enum NLULanguageCode {
  en_US = 'en-US'
}

export default abstract class NLUController {

  protected _debug: boolean;

  constructor(options: any = {}) {
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

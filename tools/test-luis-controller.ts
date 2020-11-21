import LUISController from '../src/nlu/microsoft/LUISController';

const path = require('path');
const jsonfile = require('jsonfile');

const doTestLuisNlu = () => {
    
    const configPath = path.resolve('data/config.json');
    let config: any;
    try {
        config= jsonfile.readFileSync(configPath);
    } catch (error) {
        console.error(`Error: data/config.json not found.`);
        process.exit(0);
    }

    const luisConfig: any = {
        Microsoft: {
            nluLUIS_endpoint: config.luis.endpoint,
            nluLUIS_appId: config.luis.appId,
            nluLUIS_subscriptionKey: config.luis.subscriptionKey,
        }
    }
    const luisController = new LUISController({ config: luisConfig, debug: true });

    let timeLog = {
        timeStart: new Date().getTime(),
        complete: 0,
        cloudLatency: 0,
    }
    luisController.getIntentAndEntities('do you like mammals')
        .then((intentAndEntities: any) => {
            timeLog.complete = new Date().getTime();
            timeLog.cloudLatency = timeLog.complete - timeLog.timeStart;
            console.log(`NLUIntentAndEntities: `, JSON.stringify(intentAndEntities, null, 2));
            console.log(`timeLog:`, JSON.stringify(timeLog, null, 2));
        })
        .catch((error: any) => {
            console.log(error);
        });
}

doTestLuisNlu();

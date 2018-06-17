# neo4j-knowledge-graph

An example of a simple, queryable knowledge graph implemented using neo4j with a node command line interface implemented in TypeScript.

Note: Based on a python example created by Roberto Pieraccini (http://robertopieraccini.com/home/)

## Neo4j Setup

Create an empty graph using the Neo4j Desktop app (https://neo4j.com/download-neo4j-now/).

To create the *animals* graph, copy the contents of `docs/animals.cypher` into the neo4j browser cypher/query field. (http://localhost:7474/browser/)

Verify the nodes/relationships with this cypher/query: `match (n) return n`

## NLU

neo4j-knowledge-graph can be used with either Microsoft's LUIS NLU or google's Dialogflow.com NLU.

To use LUIS, create a LUIS app (https://www.luis.ai/) and configure it by importing `docs/luis-knowledge-graph.json`. Then create a `data/LUIS-config.json` file like this:

```
{
    "endpoint": "<YOUR-ENDPOINT>",
    "appId": "<YOUR-APP-ID>",
    "subscriptionKey": "<YOUR-SUBSCRIPTION-KEY>"
}
```


To use Dialogflow, create a Dialogflow app (https://console.dialogflow.com/) and configure it by importing `docs/dialogflow-knowledge-graph.zip`. Then create a data `data/Dialogflow-config.json` file like this:

```
{
    "clientToken": "<YOUR-TOKEN>",
    "projectId": "<YOUR-PROJECT-ID>",
    "privateKey" : "<YOUR-PRIVATE-KEY>",
    "clientEmail": "<YOUR-CLIENT-EMAIL>"
}
```

## Installation and Building

```
yarn
yarn build
```

## Running

`yarn start`  
or  
`yarn debug`

## CLI

? Ask a do-you-like question or say "[user] likes [something]".  
`do you like penguins`  
`do you like bats`  
`do you like mammals`  

## Test Apps

`node ./dist/testLUISController.js --help`

```
Usage: testLUISController [options]

An application testing LUIS requests

Options:

  -V, --version            output the version number
  -q, --query <query>      The query to test
  -c, --context <context>
  -h, --help               output usage information
  ```

`node ./dist/testDialogflowController.js --help`

```
Usage: testDialogflowController [options]

  An application testing for dialogflow requests

  Options:
    -V, --version        output the version number
    -q, --query <query>  The query to test
    --lat <latitude>     latitude
    --long <logitude>    longitude
    --robot <robotname>  robot name
    --tz <timezone>      iana timezone
    -h, --help           output usage information
```

`node ./dist/testNeo4jController.js --help`

```
Usage: testNeo4jController [options]

An application for testing neo4j cyphers

Options:

  -V, --version          output the version number
  -c, --cypher <cypher>  Specify the cypher to test
  -h, --help             output usage information
```

`node ./dist/testDialogManager.js --help`

```
Usage: testDialogManager [options]

An application for testing the DialogManager class

Options:

  -V, --version            output the version number
  -q, --query <query>      The query to test
  -c, --context <context>
  -n, --nlu <nlu>          luis, dialogflow, dialogflowV1
  -h, --help               output usage information
```

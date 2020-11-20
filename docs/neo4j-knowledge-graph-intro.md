## neo4j-knowledge-graph

*Subject*: Neo4j Knowledge Graph  
*Language*: TypeScript (node)  
*Repo*: git@github.com:wwlib/neo4j-knowledge-graph.git  
*Related*: Electron-based Graph Editor Tool: [https://wwlib.github.io/graph-editor/](https://wwlib.github.io/graph-editor/)

[https://wwlib.github.io/neo4j-knowledge-graph/](https://wwlib.github.io/neo4j-knowledge-graph/)

[https://github.com/wwlib/neo4j-knowledge-graph](https://github.com/wwlib/neo4j-knowledge-graph)

[https://wwlib.github.io](https://wwlib.github.io/)

An example of a simple, queryable knowledge graph implemented using neo4j with a node command line interface implemented in TypeScript.

Knowledge Graph Demo Demo Running on Jibo (YouTube): [https://www.youtube.com/embed/0oVCR3pIz0Q](https://www.youtube.com/embed/0oVCR3pIz0Q)

Note: The code described in this post is based on an example that I worked on with Roberto Pieraccini ([http://robertopieraccini.com/home/](http://robertopieraccini.com/home/)) at Jibo, Inc. We used a similar example to test a knowledge-graph-enhanced dialog running on Jibo (as seen in the video referenced above)

Note: A nice tool for viewing and live-editing neo4j graphs is called Graph Editor and is available at [http://wwlib.org/graph-editor/](http://wwlib.org/graph-editor/)

### Overview

Overview video (YouTube): [https://www.youtube.com/embed/YFRiWiZJPkU](https://www.youtube.com/embed/pEps_xaUWVo)

### Getting Started

One way to enhance NLU-driven dialog interactions is to make use of a knowledge graph. This example uses a neo4j graph (database) to store and query a knowledge graph (kg) containing information about animals. This simple example kg represents the relationships between a robot, and handful of animals, a few animal types and a couple of humans.

This command-line version uses node-nlp by default and can be configured to use Microsoft's LUIS NLU. A neo4j graph database is also required (ideally an empty graph). Some setup is required to get started.


#### Setup

1 - Clone and install the neo4j-knowledge-graph repo
```
git clone git@github.com:wwlib/neo4j-knowledge-graph.git
cd  neo4j-knowledge-graph
yarn
```

The project looks like this:

![neo4j-knowledge-graph](./img/neo4j-kg-tutorial-vscode.png)

2 - NLU
Create either a LUIS or Dialogflow NLU agent by uploading one of the included agent description files to your LUIS or Dialogflow account:

- docs/dialogflow-knowledge-graph.zip
- docs/luis-knowledge-graph.json

See the NLU screenshots at the end of this post for descriptions of these agents.

3 - Neo4j
Download and install the free Neo4j Desktop app from [https://neo4j.com/download-neo4j-now/](https://neo4j.com/download-neo4j-now/) and create a new graph.

![neo4j-knowledge-graph](./img/neo4j-kg-tutorial-neo4j-desktop.png)

Start the graph and access it in the browser at: [http://localhost:7474/browser/](http://localhost:7474/browser/)

To populate the graph, paste the contents of docs/animals.cypher into the neo4j browser query field. Then verify that the graph is ready by entering this cypher into the browser query field:

`MATCH (n) return n limit 100`

The result should look like the image below.

![neo4j-knowledge-graph](./img/neo4j-kg-tutorial-neo4j-browser.png)

To see just the animal relationships, enter this cypher into the browser query field:

`match (n)-[r:IS_A]-(m) return n, r, m`

The result should look like the image below

![neo4j-knowledge-graph](./img/neo4j-kg-tutorial-animals-IS_A.png)

4 - Configuring the neo4j-knowledge-graph command-line app

Copy `data/config-example.json` and rename it `data/config.json`

Fill out the user and password fields for your neo4j graph. (optional: fill out the access credentials for your LUIS agent). 

```
{
   "luis": {
        "endpoint": "",
        "appId": "",
        "subscriptionKey": ""
    },
    "neo4j": {
        "url": "bolt://localhost:7687",
        "user": "neo4j",
        "password": ""
    }
}
```

Save the `data/config.json` file.

#### Running the command line app

In a terminal window, in the `neo4j-knowledge-graph` directory, build and run the command line app:

```
yarn build
yarn debug
```

If everything is setup correctly, you should should be prompted with:

`Ask a do-you-like question or say “[user] likes [something]”`

Try asking (typing): `do you like penguins`

The response should look like the screen below:

![neo4j-knowledge-graph](./img/neo4j-kg-tutorial-doYouLike-penguins.png)

The example graph contains a set of animal-related nodes and relationships that looks like this (as seen in Graph Editor):

![neo4j-knowledge-graph](./img/graph-editor-animals-IS_A.png)

The graph also contains nodes and relationship relating a robot and a couple of users to the animals:

![neo4j-knowledge-graph](./img/neo4j-kg-tutorial-LIKES-cynthia-no-penguins.png)

According to the graph, the robot likes Flies, Zebras, Whales, Armadillos, Flamingos, and Penguins. Andrew likes whales. Cynthia likes the robot. Asking, “do you like whales” produces the response below: “You know it. One of my favorite animals...and I know that Andrew likes them too.”

Note: In the Penguin node has a special RobotLikes property which is used in the response. A generic response is generated for nodes that do not have this property.

![neo4j-knowledge-graph](./img/neo4j-kg-tutorial-doYouLike-whales.png)

To answer the question, “Do you like bats”, the app must make an upward reference because the robot does not have a direct LIKES relationship to bats. The app checks the bat’s parent node, AnimalType (Mammal), and then responds with a list of mammals that the robot does like:

“I don’t know if I like bats, but they are Mammals and I do like Mammals. Of all the Mammals I like Armadillos, Zebras, and Whales.”

![neo4j-knowledge-graph](./img/neo4j-kg-tutorial-doYouLike-bats.png)

![neo4j-knowledge-graph](./img/neo4j-kg-tutorial-mammals-LIKES.png)

The graph can be modified by asserting that a user likes something. For example, asserting that “cynthia likes penguins” produces the result:

OK. I understand that cynthia likes penguins. That’s cool.


![neo4j-knowledge-graph](./img/neo4j-kg-tutorial-userLikes-cynthia.png)

Querying the graph now reveals that the fact that Cynthia likes penguins has been incorporated:

`match (n)-[r:LIKES]-(m) return n, r, m`

![neo4j-knowledge-graph](./img/neo4j-kg-tutorial-LIKES-cynthia-penguins.png)

Now, asking if the robot likes penguins produces a response that includes the new information about Cynthia:

![neo4j-knowledge-graph](./img/neo4j-kg-tutorial-doYouLike-penguins-cynthia.png)

When asking about an AnimalType, like ‘Animal’, the answer will include all of the descendants that are liked by the robot.

![neo4j-knowledge-graph](./img/neo4j-kg-tutorial-doYouLike-animals.png)

### Summary

This simple example offers a quick way to incorporate a knowledge graph into a dialog interaction. As seen in the intro video (at the start of the post) when this kind of interaction is embodied by a social robot like Jibo, the experience is compelling - especially when the app/robot remembers information asserted by the user.

The example suggests that knowledge graphs may offer a path to take to making automated dialog significantly more human-like

### Appendix: NLU Setup Details

#### LUIS

![LUIS](./img/LUIS-kg-apps.png)

![LUIS](./img/LUIS-kg-intents.png)

![LUIS](./img/LUIS-kg-intent-launchDoYouLike.png)

![LUIS](./img/LUIS-kg-intent-launchUserLikes.png)

![LUIS](./img/LUIS-kg-entities.png)

![LUIS](./img/LUIS-kg-entity-thing.png)

![LUIS](./img/LUIS-kg-entity-user.png)

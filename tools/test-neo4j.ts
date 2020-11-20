import Neo4jController, {D3Helper} from '../src/neo4j';

const program = require('commander');
const prettyjson = require('prettyjson');

let neo4jController = new Neo4jController();

program
.version('0.0.1')
.description('An application testing neo4j cyphers')
.option('-c, --cypher <cypher>', 'Specify the cypher to test')
.option('--d3', 'Parse results with D3Helper')
.parse(process.argv);

let cypher: string = 'match (n) return n LIMIT 25';
if (program.cypher) {
    console.log(program.cypher);
    cypher = program.cypher;
}

let d3HelperFlag: boolean = false;
if (program.d3) {
    console.log(program.d3);
    d3HelperFlag = true;
}

if (d3HelperFlag) {
  neo4jController.parseCypherWithD3Helper(cypher)
      .then((response: string) => {
            let output: string = prettyjson.render(response, {});
            console.log(output);
      })
      .catch((err) => {
          console.log(`ERROR: neo4jController\n`, err)
      });
} else {
  neo4jController.call(cypher)
      .then((response: string) => {
          let output: string = prettyjson.render(response, {});
          console.log(output);
      })
      .catch((err) => {
          console.log(`ERROR: neo4jController\n`, err)
      });
}

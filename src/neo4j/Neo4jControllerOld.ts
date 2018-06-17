const neo4j = require('neo4j');

export default class Neo4jController {

    public db: any = new neo4j.GraphDatabase('http://localhost:7474');

    test(query_text: string): Promise<any> {

        return new Promise((resolve, reject) => {
            this.db.cypher({
                query: query_text,
                params: {
                },
            }, function (err: any, results: any) {
                if (err) {
                    reject(err);
                } else {
                    // console.log(`Neo4jController: test`, results);
                    var result = results[0];
                    if (!result) {
                        // console.log('No results found.');
                        resolve('No results found.');
                    } else {
                        // console.log(JSON.stringify(result, null, 4));
                        resolve(JSON.stringify(result, null, 4));
                    }
                }
            });
        });
    }

    call(query_text: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.db.cypher({
                query: query_text,
                params: {
                },
            }, function (err: any, results: any) {
                if (err) {
                    reject(err);
                } else {
                    // console.log(`Neo4jController: call`, JSON.stringify(results, null, 4));
                    resolve(results);
                }
            });
        });
    }
}

    // var db = new neo4j.GraphDatabase('http://localhost:7474');

    // db.cypher({
    //     query: answers.query,
    //     params: {
    //     },
    // }, function (err: any, results: any) {
    //     if (err) throw err;
    //     var result = results[0];
    //     if (!result) {
    //         console.log('No results found.');
    //     } else {
    //         var data = result['n'];
    //         console.log(JSON.stringify(data, null, 4));
    //     }
    // });

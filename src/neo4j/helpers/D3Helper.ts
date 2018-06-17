import BoltToD3 from './BoltToD3';

export default class PartnersGraphHelper {

    static data(cypherResponse: any): any[] {
        let result: any = {};

        // console.log(cypherResponse);
        let parser = new BoltToD3();
        result = parser.parse(cypherResponse)

        return result;
    }
}

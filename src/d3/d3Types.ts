export namespace d3Types {
  export type d3Node = {
    id: string,
    group?: number,
    properties?: any,
    labels?: string[]
  };

  export type d3Link = {
    source: string,
    target: string,
    value?: number,
    id?: string,
    type?: string,
    startNode?: string,
    endNode?: string,
    properties?: any,
    linknum?: number
  };

  export type d3Graph = {
    nodes: d3Node[],
    links: d3Link[]
  };
}

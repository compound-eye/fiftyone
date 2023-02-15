/**
 * @generated SignedSource<<7b94ae3e3917d378fee862cfeb758bf5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type SampleFilter = {
  group?: GroupElementFilter | null;
  id?: string | null;
};
export type GroupElementFilter = {
  id?: string | null;
  slices?: ReadonlyArray<string> | null;
};
export type paginateDynamicGroupSamplesQuery$variables = {
  count?: number | null;
  cursor?: string | null;
  dataset: string;
  filter: SampleFilter;
  view: Array;
};
export type paginateDynamicGroupSamplesQuery$data = {
  readonly samples: {
    readonly edges: ReadonlyArray<{
      readonly cursor: string;
      readonly node: {
        readonly __typename: "ImageSample";
        readonly aspectRatio: number;
        readonly id: string;
        readonly sample: object;
        readonly thumbnailsOnly: boolean;
        readonly urls: ReadonlyArray<{
          readonly field: string;
          readonly url: string | null;
        }>;
      } | {
        readonly __typename: "PointCloudSample";
        readonly id: string;
        readonly sample: object;
        readonly thumbnailsOnly: boolean;
        readonly urls: ReadonlyArray<{
          readonly field: string;
          readonly url: string | null;
        }>;
      } | {
        readonly __typename: "VideoSample";
        readonly aspectRatio: number;
        readonly frameRate: number;
        readonly id: string;
        readonly sample: object;
        readonly thumbnailsOnly: boolean;
        readonly urls: ReadonlyArray<{
          readonly field: string;
          readonly url: string | null;
        }>;
      } | {
        // This will never be '%other', but we need some
        // value in case none of the concrete values match.
        readonly __typename: "%other";
      };
    }>;
    readonly pageInfo: {
      readonly endCursor: string | null;
      readonly hasNextPage: boolean;
    };
    readonly total: number | null;
  };
};
export type paginateDynamicGroupSamplesQuery = {
  response: paginateDynamicGroupSamplesQuery$data;
  variables: paginateDynamicGroupSamplesQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": 20,
  "kind": "LocalArgument",
  "name": "count"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "cursor"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "dataset"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "filter"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "view"
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "aspectRatio",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "sample",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "concreteType": "MediaURL",
  "kind": "LinkedField",
  "name": "urls",
  "plural": true,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "field",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "url",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "thumbnailsOnly",
  "storageKey": null
},
v10 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "after",
        "variableName": "cursor"
      },
      {
        "kind": "Variable",
        "name": "dataset",
        "variableName": "dataset"
      },
      {
        "kind": "Variable",
        "name": "filter",
        "variableName": "filter"
      },
      {
        "kind": "Variable",
        "name": "first",
        "variableName": "count"
      },
      {
        "kind": "Variable",
        "name": "view",
        "variableName": "view"
      }
    ],
    "concreteType": "SampleItemStrConnection",
    "kind": "LinkedField",
    "name": "samples",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "total",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "SampleItemStrEdge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "cursor",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "node",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "__typename",
                "storageKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  (v5/*: any*/),
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  (v9/*: any*/)
                ],
                "type": "ImageSample",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  (v5/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  (v9/*: any*/)
                ],
                "type": "PointCloudSample",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  (v5/*: any*/),
                  (v6/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "frameRate",
                    "storageKey": null
                  },
                  (v7/*: any*/),
                  (v8/*: any*/),
                  (v9/*: any*/)
                ],
                "type": "VideoSample",
                "abstractKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "SampleItemStrPageInfo",
        "kind": "LinkedField",
        "name": "pageInfo",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "endCursor",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "hasNextPage",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "paginateDynamicGroupSamplesQuery",
    "selections": (v10/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v4/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Operation",
    "name": "paginateDynamicGroupSamplesQuery",
    "selections": (v10/*: any*/)
  },
  "params": {
    "cacheID": "075308d9ab41e0709e67092a85745ca0",
    "id": null,
    "metadata": {},
    "name": "paginateDynamicGroupSamplesQuery",
    "operationKind": "query",
    "text": "query paginateDynamicGroupSamplesQuery(\n  $count: Int = 20\n  $cursor: String = null\n  $dataset: String!\n  $view: BSONArray!\n  $filter: SampleFilter!\n) {\n  samples(dataset: $dataset, view: $view, first: $count, after: $cursor, filter: $filter) {\n    total\n    edges {\n      cursor\n      node {\n        __typename\n        ... on ImageSample {\n          id\n          aspectRatio\n          sample\n          urls {\n            field\n            url\n          }\n          thumbnailsOnly\n        }\n        ... on PointCloudSample {\n          id\n          sample\n          urls {\n            field\n            url\n          }\n          thumbnailsOnly\n        }\n        ... on VideoSample {\n          id\n          aspectRatio\n          frameRate\n          sample\n          urls {\n            field\n            url\n          }\n          thumbnailsOnly\n        }\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "8e756016d0616c99d01e3d4dc14bed1e";

export default node;

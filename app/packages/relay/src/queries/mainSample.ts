import { graphql } from "react-relay";

import r from "../resolve";

export default r(graphql`
  query mainSampleQuery(
    $dataset: String!
    $view: BSONArray!
    $filter: SampleFilter!
    $filters: JSON
  ) {
    sample(dataset: $dataset, view: $view, filters: $filters, filter: $filter) {
      __typename
      ... on ImageSample {
        id
        sample
        urls {
          field
          url
        }
        thumbnailsOnly
      }
      ... on PointCloudSample {
        id
        sample
        urls {
          field
          url
        }
        thumbnailsOnly
      }
      ... on VideoSample {
        id
        sample
        frameRate
        urls {
          field
          url
        }
        thumbnailsOnly
      }
    }
  }
`);

import { graphql } from "react-relay";
import r from "../resolve";

export default r(graphql`
  query paginateSamplesQuery(
    $count: Int = 20
    $after: String = null
    $dataset: String!
    $view: BSONArray!
    $filter: SampleFilter!
    $filters: BSON = null
    $extendedStages: BSON
    $paginationData: Boolean = true
    $thumbnailsOnly: Boolean = true
  ) {
    samples(
      dataset: $dataset
      view: $view
      first: $count
      after: $after
      filter: $filter
      filters: $filters
      extendedStages: $extendedStages
      paginationData: $paginationData
      thumbnailsOnly: $thumbnailsOnly
    ) {
      pageInfo {
        hasNextPage
      }
      edges {
        cursor
        node {
          __typename
          ... on ImageSample {
            id
            aspectRatio
            sample
            urls {
              field
              url
            }
            thumbnailsOnly
          }
          ... on PointCloudSample {
            aspectRatio
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
            aspectRatio
            frameRate
            frameNumber
            sample
            urls {
              field
              url
            }
            thumbnailsOnly
          }
        }
      }
    }
  }
`);

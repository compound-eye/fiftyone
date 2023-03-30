import { useRef } from "react";
import { Snapshot, useRecoilCallback } from "recoil";

import { ItemIndexMap } from "@fiftyone/flashlight/src/state";
import * as fos from "@fiftyone/state";
import { getFetchFunction } from "@fiftyone/utilities";

import { PageParameters, pageParameters } from "./recoil";
import useLocationHash from "./useLocationHash";

/**
 * Pyton object returned from the `/samples` API.
 */
interface SamplesResponse {
  results: Array<{
    sample: fos.AppSample & { frame_number?: number };
    aspect_ratio: number;
    frame_rate?: number;
    urls: Array<{ field: string; url: string }>;
    thumbnails_only: boolean;
  }>;
}

/**
 * Returns a full sample by id, querying from the backend if necessary.
 *
 * Throws if the provided sampleId does not exist in the store.
 */
async function getFullSample<T extends fos.Lookers>(
  store: fos.LookerStore<T>,
  pageParams: PageParameters,
  sampleId: string
): Promise<fos.SampleData> {
  // Query for the full sample from the backend
  const { results } = (await getFetchFunction()("POST", "/samples", {
    ...pageParams,
    sample_id: sampleId,
  })) as SamplesResponse;
  const result = results[0];

  const newSample: fos.SampleData = {
    sample: result.sample,
    aspectRatio: result.aspect_ratio,
    frameRate: result.frame_rate,
    frameNumber: result.sample.frame_number,
    urls: Object.fromEntries(result.urls.map(({ field, url }) => [field, url])),
    thumbnailsOnly: false,
  };

  // Save the new sample in the global store
  store.samples.set(result.sample._id, newSample);
  return newSample;
}

export default <T extends fos.Lookers>(store: fos.LookerStore<T>) => {
  const expandSample = fos.useExpandSample();
  const setSample = fos.useSetExpandedSample(false);
  const clear = fos.useClearModal();
  // ID of the sample currently shown in the modal
  const currentSampleId = useRef<string | null>(null);
  const { hash, changeHash } = useLocationHash();

  return useRecoilCallback(
    ({ snapshot }) =>
      async (
        next: () => Promise<void>,
        sampleId: string,
        itemIndexMap: ItemIndexMap
      ): Promise<void> => {
        const clickedIndex = itemIndexMap[sampleId];
        // Cache the page parameters so that we don't need `snapshot` (which
        // is released once the useRecoilCallback ends) to async load samples.
        const pageParams = await snapshot.getPromise(
          pageParameters(/* modal= */ true)
        );

        // Get the full sample if the existing sample has thumbnails only.
        // Then set it in the modal if the user hasn't navigated away.
        const getAndSetFullSampleIfNeeded = (
          existingSample: fos.SampleData
        ) => {
          if (existingSample.thumbnailsOnly) {
            const sampleId = existingSample.sample._id;
            getFullSample(store, pageParams, sampleId).then((sample) => {
              // The ID of the sample in the modal must match the queried sample
              if (currentSampleId.current === sampleId) {
                setSample(sample, { index: clickedIndex, getIndex });
              }
            });
          }
        };

        // getIndex is called when clicking the left/right arrows in the modal
        const getIndex = (index: number) => {
          const id = store.indices.get(index);

          const promise = id ? Promise.resolve(id) : next();

          promise
            ? promise.then(async () => {
                const sampleId = store.indices.get(index);

                if (!sampleId) {
                  throw new Error("unable to paginate to next sample");
                }

                const existingSample = store.samples.get(sampleId);
                if (existingSample == null) {
                  throw new Error(`sample does not exist (id=${sampleId})`);
                }
                currentSampleId.current = sampleId;
                setSample(existingSample, { index, getIndex });

                // Query for the full sample if needed
                getAndSetFullSampleIfNeeded(existingSample);
              })
            : clear();
        };

        // Show the existing sample first
        const existingSample = store.samples.get(sampleId);
        if (existingSample == null) {
          throw new Error(`sample does not exist (id=${sampleId})`);
        }
        currentSampleId.current = sampleId;
        //changeHash(sampleId);
        expandSample(existingSample, { index: clickedIndex, getIndex });

        // Query for the full sample if needed
        getAndSetFullSampleIfNeeded(existingSample);
      },
    [store]
  );
};

import { Snapshot, useRecoilCallback } from "recoil";

import { ItemIndexMap } from "@fiftyone/flashlight/src/state";
import * as fos from "@fiftyone/state";
import { getFetchFunction } from "@fiftyone/utilities";

import { pageParameters } from "./recoil";

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
  snapshot: Snapshot,
  sampleId: string
): Promise<fos.SampleData | null> {
  const existingSample = store.samples.get(sampleId);

  if (!existingSample) {
    return null;
  }

  if (!existingSample.thumbnailsOnly) {
    return existingSample;
  } else {
    // Query for the full sample from the backend
    const { zoom, ...params } = await snapshot.getPromise(
      pageParameters(/* modal= */ true)
    );

    const { results } = (await getFetchFunction()("POST", "/samples", {
      ...params,
      sample_id: sampleId,
    })) as SamplesResponse;
    const result = results[0];

    const newSample: fos.SampleData = {
      sample: result.sample,
      aspectRatio: result.aspect_ratio,
      frameRate: result.frame_rate,
      frameNumber: result.sample.frame_number,
      urls: Object.fromEntries(
        result.urls.map(({ field, url }) => [field, url])
      ),
      thumbnailsOnly: false,
    };

    // Save the new sample in the global store
    store.samples.set(result.sample._id, newSample);
    return newSample;
  }
}

export default <T extends fos.Lookers>(store: fos.LookerStore<T>) => {
  const expandSample = fos.useExpandSample();
  const setSample = fos.useSetExpandedSample(false);
  const clear = fos.useClearModal();

  return useRecoilCallback(
    ({ snapshot }) =>
      async (
        next: () => Promise<void>,
        sampleId: string,
        itemIndexMap: ItemIndexMap
      ): Promise<void> => {
        const clickedIndex = itemIndexMap[sampleId];

        const getIndex = (index: number) => {
          const id = store.indices.get(index);

          const promise = id ? Promise.resolve(id) : next();

          promise
            ? promise.then(async () => {
                const sampleId = store.indices.get(index);

                if (!sampleId) {
                  throw new Error("unable to paginate to next sample");
                }

                const sample = await getFullSample(store, snapshot, sampleId);
                if (!sample) {
                  throw new Error(`sample does not exist (id=${sampleId})`);
                }

                setSample(sample, { index, getIndex });
              })
            : clear();
        };

        const sample = await getFullSample(store, snapshot, sampleId);
        if (!sample) {
          throw new Error(`sample does not exist (id=${sampleId})`);
        }

        expandSample(sample, { index: clickedIndex, getIndex });
      },
    [store]
  );
};

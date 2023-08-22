import { FlashlightConfig } from "@fiftyone/flashlight";
import { getFetchFunction } from "@fiftyone/utilities";
import { get } from "lodash";
import { useRelayEnvironment } from "react-relay";
import { RecoilState, selectorFamily, useRecoilCallback } from "recoil";
import { State } from "../recoil/types";
import * as atoms from "../recoil/atoms";
import * as filterAtoms from "../recoil/filters";
import * as groupAtoms from "../recoil/groups";
import * as modalAtoms from "../recoil/modal";
import * as schemaAtoms from "../recoil/schema";
import * as selectors from "../recoil/selectors";
import * as sidebarAtoms from "../recoil/sidebar";
import { getSanitizedGroupByExpression } from "../recoil/utils";
import * as viewAtoms from "../recoil/view";
import { LookerStore, Lookers } from "./useLookerStore";
import useSetExpandedSample from "./useSetExpandedSample";
import { groupSlice } from "../recoil/groups";

interface PageParameters {
  filters: State.Filters;
  dataset: string;
  view: State.Stage[];
  zoom: boolean;
  thumbnailsOnly: boolean;
}

const pageParameters2 = selectorFamily<PageParameters, boolean>({
  key: "pageParameters2",
  get:
    (modal) =>
    ({ get }) => {
      return {
        filters: get(modal ? filterAtoms.modalFilters : filterAtoms.filters),
        view: get(viewAtoms.view),
        dataset: get(selectors.datasetName),
        extended: get(selectors.extendedStages),
        zoom: get(viewAtoms.isPatchesView) && get(atoms.cropToContent(modal)),
        slice: get(groupSlice(false)),
        thumbnailsOnly: !modal,
      };
    },
});

/**
 * Pyton object returned from the `/samples` API.
 */
interface SamplesResponse {
  results: Array<{
    sample: any, //Sample & { frame_number?: number };
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
async function getFullSample<T extends Lookers>(
  store: LookerStore<T>,
  pageParams: PageParameters,
  sampleId: string
): Promise<modalAtoms.ModalSample | null> {
  const existingSample = store.samples.get(sampleId);

  if (!existingSample) {
    return null;
  }

  if (!existingSample.thumbnailsOnly) {
    return existingSample;
  } else {
    const { results } = (await getFetchFunction()("POST", "/samples", {
      ...pageParams,
      sample_id: sampleId,
    })) as SamplesResponse;
    const result = results[0];

    const newSample: modalAtoms.ModalSample = {
      ...existingSample,
      sample: result.sample,
      urls: result.urls.map(({ field, url }) => ({field, url})),
      thumbnailsOnly: false,
    };

    // Save the new sample in the global store
    store.samples.set(result.sample.id, newSample);
    return newSample;
  }
}

export default <T extends Lookers>(store: LookerStore<T>) => {
  const environment = useRelayEnvironment();
  const setExpandedSample = useSetExpandedSample();

  const setModalState = useRecoilCallback(
    ({ set, snapshot }) =>
      async (navigation: modalAtoms.ModalNavigation) => {
        const data = [
          [filterAtoms.modalFilters, filterAtoms.filters],
          ...["colorBy", "multicolorKeypoints", "showSkeletons"].map((key) => {
            return [
              selectors.appConfigOption({ key, modal: false }),
              selectors.appConfigOption({ key, modal: false }),
            ];
          }),
          [
            schemaAtoms.activeFields({ modal: true }),
            schemaAtoms.activeFields({ modal: false }),
          ],
          [atoms.cropToContent(true), atoms.cropToContent(false)],
          [atoms.sortFilterResults(true), atoms.sortFilterResults(false)],
          [
            sidebarAtoms.sidebarGroupsDefinition(true),
            sidebarAtoms.sidebarGroupsDefinition(false),
          ],
          [sidebarAtoms.sidebarWidth(true), sidebarAtoms.sidebarWidth(false)],
          [
            sidebarAtoms.sidebarVisible(true),
            sidebarAtoms.sidebarVisible(false),
          ],
          [sidebarAtoms.textFilter(true), sidebarAtoms.textFilter(false)],

          [groupAtoms.groupStatistics(true), groupAtoms.groupStatistics(false)],
          [groupAtoms.groupSlice(true), groupAtoms.groupSlice(false)],
        ];

        const groupSlice = await snapshot.getPromise(
          groupAtoms.groupSlice(false)
        );

        let pinned3d = false;
        let activeSlices = [];
        if (groupSlice) {
          const map = await snapshot.getPromise(groupAtoms.groupMediaTypesMap);
          if (map[groupSlice] === "point_cloud") {
            pinned3d = true;
            activeSlices = [groupSlice];
          }
        }
        set(groupAtoms.pinned3d, pinned3d);
        set(groupAtoms.activePcdSlices, activeSlices);

        const results = await Promise.all(
          data.map(([_, get]) =>
            snapshot.getPromise(get as RecoilState<unknown>)
          )
        );

        for (const i in results) {
          set(data[i][0], results[i]);
        }

        set(modalAtoms.currentModalNavigation, () => navigation);
      },
    [environment]
  );

  return useRecoilCallback<
    Parameters<NonNullable<FlashlightConfig<number>["onItemClick"]>>,
    void
  >(
    ({ snapshot }) =>
      async (next, sampleId, itemIndexMap) => {
        const clickedIndex = itemIndexMap[sampleId];
        const hasGroupSlices = await snapshot.getPromise(
          groupAtoms.hasGroupSlices
        );
        const groupField = await snapshot.getPromise(groupAtoms.groupField);
        const dynamicGroupParameters = await snapshot.getPromise(
          viewAtoms.dynamicGroupParameters
        );

        // Cache the page parameters so that we don't need `snapshot` (which
        // is released once the useRecoilCallback ends) to async load samples.
        const pageParams = await snapshot.getPromise(
          pageParameters2(/* modal= */ true)
        );

        // Get the full sample if the existing sample has thumbnails only.
        // Then set it in the modal if the user hasn't navigated away.
        const getAndSetFullSampleIfNeeded = (
          existingSample: modalAtoms.ModalSample
        ) => {
          if (existingSample.thumbnailsOnly) {
            const sampleId = existingSample.sample.id;
            // Asynchronously update the sample in the store
            getFullSample(store, pageParams, sampleId);
          }
        };

        const getIndex = async (index: number) => {
          if (!store.indices.has(index)) await next();

          const id = store.indices.get(index);

          if (!id) {
            throw new Error("unable to paginate to next sample");
          }

          const sample = store.samples.get(id);
          if (!sample) {
            throw new Error(`sample does not exist (id=${id})`);
          }

          // Query for the full sample if needed
          getAndSetFullSampleIfNeeded(sample);

          let groupId: string;
          if (hasGroupSlices) {
            groupId = get(sample.sample, groupField)._id as string;
          }

          let groupByFieldValue: string;
          if (dynamicGroupParameters?.groupBy) {
            groupByFieldValue = String(
              get(
                sample.sample,
                getSanitizedGroupByExpression(dynamicGroupParameters.groupBy)
              )
            );
          }

          return { id, groupId, groupByFieldValue };
        };

        setModalState(getIndex).then(() => setExpandedSample(clickedIndex));
      },
    [setExpandedSample, setModalState, store]
  );
};

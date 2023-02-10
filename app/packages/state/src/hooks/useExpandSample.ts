import { FlashlightConfig } from "@fiftyone/flashlight";
import * as fos from "@fiftyone/state";
import { getFetchFunction } from "@fiftyone/utilities";
import { get } from "lodash";
import { useRelayEnvironment } from "react-relay";
import { RecoilState, useRecoilCallback } from "recoil";
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

/**
 * Pyton object returned from the `/samples` API.
 */
interface SamplesResponse {
  results: Array<{
    sample: fos.ModalSample & { frame_number?: number };
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
): Promise<fos.ModalSampleData | null> {
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

    const newSample: fos.ModalSampleData = {
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

        const getIndex = async (index: number) => {
          if (!store.indices.has(index)) await next();

          const id = store.indices.get(index);

          if (!id) {
            throw new Error("unable to paginate to next sample");
          }

          const sample = await getFullSample(store, snapshot, id);
          if (!sample) {
            throw new Error(`sample does not exist (id=${id})`);
          }

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

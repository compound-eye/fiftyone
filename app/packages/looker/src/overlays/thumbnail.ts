import { getFetchOrigin, getFetchPathPrefix } from "@fiftyone/utilities";

import {
  BaseLabel,
  CONTAINS,
  isShown,
  Overlay,
  PointInfo,
  SelectData,
} from "./base";
import { BaseState, Coordinates } from "../state";
import { t } from "./util";

interface ThumbnailInfo extends BaseLabel {}

/**
 * Overlay for rendering thumbnail images by drawing directly to the canvas.
 *
 * This overlay is intended for the grid view only and is not interactable.
 */
export default class ThumbnailOverlay<State extends BaseState>
  implements Overlay<State>
{
  readonly field: string;
  readonly thumbnailField: string;
  readonly thumbnailPath: string;
  private image: HTMLImageElement;

  constructor(field: string, thumbnailField: string, thumbnailPath: string) {
    this.field = field;
    this.thumbnailField = thumbnailField;
    this.thumbnailPath = thumbnailPath;

    // Preload the image via the `/media` route
    this.image = document.createElement("img");
    this.image.crossOrigin = "anonymous";
    this.image.src = `${getFetchOrigin()}${getFetchPathPrefix()}/media?filepath=${encodeURIComponent(
      thumbnailPath
    )}`;
  }

  draw(ctx: CanvasRenderingContext2D, state: Readonly<State>): void {
    // Transform the image based on the state (derived from pan and zoom).
    // This is not necessary for thumbnails, but it's short enough to leave in
    // for consistency across overlays.
    const [tlx, tly] = t(state, 0, 0);
    const [brx, bry] = t(state, 1, 1);
    const tmp = ctx.globalAlpha;
    ctx.globalAlpha = state.options.alpha;
    ctx.drawImage(this.image, tlx, tly, brx - tlx, bry - tly);
    ctx.globalAlpha = tmp;
  }

  // There is no need to support the remaining methods, as the ThumbnailOverlay
  // won't be used in a modal, and won't need to handle any interactions.
  // However, they'll still be called, and should return empty values.

  containsPoint(_state: Readonly<State>): CONTAINS {
    return CONTAINS.NONE;
  }

  getMouseDistance(_state: Readonly<State>): number {
    return Infinity;
  }

  getPointInfo(_state: Readonly<State>): PointInfo<ThumbnailInfo> {
    return {
      color: "",
      label: {
        id: "",
        _cls: "Thumbnail",
        tags: [],
      },
      field: this.field,
      type: "Thumbnail",
    };
  }

  getSelectData(): SelectData {
    return {
      id: "",
      field: this.field,
    };
  }

  isSelected(_state: Readonly<State>): boolean {
    return false;
  }

  isShown(state: Readonly<State>): boolean {
    const fakeLabel = {
      id: "",
      _cls: "",
      tags: [],
    };
    return isShown(state, this.field, fakeLabel);
  }

  getPoints(): Coordinates[] {
    return [];
  }

  getSizeBytes(): number {
    return 0;
  }
}

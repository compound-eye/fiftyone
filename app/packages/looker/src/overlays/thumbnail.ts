/**
 * Copyright 2017-2022, Voxel51, Inc.
 */
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

    this.image = document.createElement("img");
    this.image.crossOrigin = "anonymous";
    this.image.src = `${getFetchOrigin()}${getFetchPathPrefix()}/media?filepath=${encodeURIComponent(
      thumbnailPath
    )}`;
  }

  containsPoint(_state: Readonly<State>): CONTAINS {
    return CONTAINS.NONE;
  }

  draw(ctx: CanvasRenderingContext2D, state: Readonly<State>): void {
    const [tlx, tly] = t(state, 0, 0);
    const [brx, bry] = t(state, 1, 1);
    const tmp = ctx.globalAlpha;
    ctx.globalAlpha = state.options.alpha;
    console.log("ThumbnailOverlay.draw", tlx, tly, brx - tlx, bry - tly);
    ctx.drawImage(this.image, tlx, tly, brx - tlx, bry - tly);
    ctx.globalAlpha = tmp;
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

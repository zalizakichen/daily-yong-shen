import { GAN_WUXING, ZHI_CANG_GAN } from "./constants";
import type { DiZhi, TianGan, WuXing } from "./types";

export function allocateVectorPoints(
  gan: string,
  zhi: string,
  ganWeight: number,
  vector: Record<WuXing, number>,
  zhiWeight: number = ganWeight,
) {
  const gWuXing = GAN_WUXING[gan as TianGan];
  if (gWuXing) {
    vector[gWuXing] += ganWeight;
  }

  const items = ZHI_CANG_GAN[zhi as DiZhi];
  if (items) {
    items.forEach((item) => {
      vector[item.wuXing] += zhiWeight * item.ratio;
    });
  }
}

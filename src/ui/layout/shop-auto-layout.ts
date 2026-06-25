export type ShopInfoActionRowLayout = {
  actionX: number;
  infoWidth: number;
  infoX: number;
};

export type ShopInfoAuxActionRowLayout = ShopInfoActionRowLayout & {
  auxX: number;
};

type ShopInfoActionRowLayoutArgs = {
  actionWidth: number;
  infoToActionGap: number;
  leadingToInfoGap: number;
  leadingWidth: number;
  rowWidth: number;
};

type ShopInfoAuxActionRowLayoutArgs = {
  actionWidth: number;
  auxToActionGap: number;
  auxWidth: number;
  infoToAuxGap: number;
  leadingToInfoGap: number;
  leadingWidth: number;
  rowWidth: number;
};

export function resolveLegacyRightAnchoredStripOffsetX(
  baseOffsetX: number,
  index: number,
  itemWidth: number,
  gap: number,
): number {
  return baseOffsetX + (index * (itemWidth + gap));
}

export function resolveShopInfoActionRowLayout(
  args: ShopInfoActionRowLayoutArgs,
): ShopInfoActionRowLayout {
  const actionX = args.rowWidth - args.actionWidth;
  const infoX = args.leadingWidth + args.leadingToInfoGap;

  return {
    actionX,
    infoWidth: Math.max(0, actionX - args.infoToActionGap - infoX),
    infoX,
  };
}

export function resolveShopInfoAuxActionRowLayout(
  args: ShopInfoAuxActionRowLayoutArgs,
): ShopInfoAuxActionRowLayout {
  const actionX = args.rowWidth - args.actionWidth;
  const auxX = actionX - args.auxToActionGap - args.auxWidth;
  const infoX = args.leadingWidth + args.leadingToInfoGap;

  return {
    actionX,
    auxX,
    infoWidth: Math.max(0, auxX - args.infoToAuxGap - infoX),
    infoX,
  };
}

export const SHOP_STATE_EVENT = "krishighar:shop-state-change";

export const emitShopStateChange = (detail = {}) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SHOP_STATE_EVENT, { detail }));
};

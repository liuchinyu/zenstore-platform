// 統一的 className 生成函數
export const getNavigationClassName = (
  isMobile: boolean,
  showOption: boolean
) => {
  if (isMobile) {
    return showOption ? "nav-link text-white d-inline-block" : "d-none";
  }
  return "nav-link text-white";
};

// 統一的圖標 className 生成函數
export const getIconClassName = (isMobile: boolean, showOption: boolean) => {
  if (isMobile) {
    return showOption
      ? `fa-solid fa-chevron-down ms-1 text-white iconHover iconSm`
      : "d-none";
  }
  return `fa-solid fa-chevron-down iconSm`;
};

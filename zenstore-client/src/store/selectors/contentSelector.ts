import { createSelector } from "@reduxjs/toolkit";

// 技術文件
export const selectContentTechResources = createSelector(
  [(state) => state.content?.techResources],
  (techResources) => techResources,
);

// 輪播圖
export const selectCarousel = createSelector(
  [(state) => state.content?.carousel],
  (carousel) => carousel,
);

// 跑馬燈
export const selectMarquee = createSelector(
  [(state) => state.content?.marquee],
  (marquee) => marquee,
);

// 商店資訊
export const selectStoreInfo = createSelector(
  [(state) => state.content?.storeInfo],
  (storeInfo) => storeInfo,
);

// 最新消息
export const selectNews = createSelector(
  [(state) => state.content?.news],
  (news) => news,
);

// 公告
export const selectAnnouncements = createSelector(
  [(state) => state.content?.announcements],
  (announcements) => announcements,
);

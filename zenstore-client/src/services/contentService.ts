import axiosInstance, { axios } from "@/lib/axios";

class ContentService {
  // 進行中請求去重 + TTL 快取
  private static readonly TTL = 10 * 60 * 1000;

  private static techResourcesCache: any[] | null = null;
  private static techResourcesFetchedAt = 0;
  private static techResourcesPromise: Promise<any[]> | null = null;

  private static carouselCache: any[] | null = null;
  private static carouselFetchedAt = 0;
  private static carouselPromise: Promise<any[]> | null = null;

  private static storeInfoCache: any[] | null = null;
  private static storeInfoFetchedAt = 0;
  private static storeInfoPromise: Promise<any[]> | null = null;

  private static newsCache: any[] | null = null;
  private static newsFetchedAt = 0;
  private static newsPromise: Promise<any[]> | null = null;

  private static announcementsCache: any[] | null = null;
  private static announcementsFetchedAt = 0;
  private static announcementsPromise: Promise<any[]> | null = null;

  private static marqueeCache: any[] | null = null;
  private static marqueeFetchedAt = 0;
  private static marqueePromise: Promise<any[]> | null = null;

  static async fetchTechResources() {
    const now = Date.now();
    if (
      this.techResourcesCache &&
      now - this.techResourcesFetchedAt < this.TTL
    ) {
      return this.techResourcesCache;
    }
    if (this.techResourcesPromise) return this.techResourcesPromise;

    this.techResourcesPromise = axiosInstance
      .get("/content/tech-resources")
      .then((res) => {
        const data = res.data.data ?? [];
        this.techResourcesCache = data;
        this.techResourcesFetchedAt = Date.now();
        return data;
      })
      .finally(() => {
        this.techResourcesPromise = null;
      });

    return this.techResourcesPromise;
  }

  static async fetchCarousel() {
    const now = Date.now();
    if (this.carouselCache && now - this.carouselFetchedAt < this.TTL) {
      return this.carouselCache;
    }
    if (this.carouselPromise) return this.carouselPromise;

    this.carouselPromise = axiosInstance
      .get("/content/carousel")
      .then((res) => {
        const data = res.data.data ?? [];
        this.carouselCache = data;
        this.carouselFetchedAt = Date.now();
        return data;
      })
      .finally(() => {
        this.carouselPromise = null;
      });

    return this.carouselPromise;
  }

  static async fetchStoreInfo() {
    const now = Date.now();
    if (this.storeInfoCache && now - this.storeInfoFetchedAt < this.TTL) {
      return this.storeInfoCache;
    }
    if (this.storeInfoPromise) return this.storeInfoPromise;

    this.storeInfoPromise = axiosInstance
      .get("/content/store-info/active")
      .then((res) => {
        const data = res.data.data ?? [];
        this.storeInfoCache = data;
        this.storeInfoFetchedAt = Date.now();
        return data;
      })
      .finally(() => {
        this.storeInfoPromise = null;
      });
    return this.storeInfoPromise;
  }

  static async fetchNews() {
    const now = Date.now();
    if (this.newsCache && now - this.newsFetchedAt < this.TTL) {
      return this.newsCache;
    }
    if (this.newsPromise) return this.newsPromise;

    this.newsPromise = axiosInstance
      .get("/content/news")
      .then((res) => {
        const data = res.data.data ?? [];
        this.newsCache = data;
        this.newsFetchedAt = Date.now();
        return data;
      })
      .finally(() => {
        this.newsPromise = null;
      });

    return this.newsPromise;
  }

  static async fetchAnnouncements() {
    const now = Date.now();
    if (
      this.announcementsCache &&
      now - this.announcementsFetchedAt < this.TTL
    ) {
      return this.announcementsCache;
    }
    if (this.announcementsPromise) return this.announcementsPromise;

    this.announcementsPromise = axiosInstance
      .get("/content/announcements/active")
      .then((res) => {
        const data = res.data.data ?? [];
        this.announcementsCache = data;
        this.announcementsFetchedAt = Date.now();
        return data;
      })
      .finally(() => {
        this.announcementsPromise = null;
      });

    return this.announcementsPromise;
  }

  static async fetchMarquee() {
    const now = Date.now();
    if (this.marqueeCache && now - this.marqueeFetchedAt < this.TTL) {
      return this.marqueeCache;
    }
    if (this.marqueePromise) return this.marqueePromise;

    this.marqueePromise = axiosInstance
      .get("/content/marquee/active")
      .then((res) => {
        const data = res.data.data ?? [];
        this.marqueeCache = data;
        this.marqueeFetchedAt = Date.now();
        return data;
      })
      .finally(() => {
        this.marqueePromise = null;
      });
    return this.marqueePromise;
  }
}

export default ContentService;

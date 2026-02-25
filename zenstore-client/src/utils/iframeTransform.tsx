export function convertToEmbedUrl(url: string) {
  if (!url) return "";

  try {
    // 處理 youtube.com/watch?v= 格式
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = new URL(url).searchParams.get("v");
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // 處理 youtu.be/ 格式
    else if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1].split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // 如果已經是嵌入格式，直接返回
    else if (url.includes("youtube.com/embed/")) {
      return url;
    }
    // 其他情況，返回原始 URL
    return url;
  } catch (error) {
    console.error("URL 轉換錯誤:", error);
    return url;
  }
}

// 添加默認導出
export default convertToEmbedUrl;

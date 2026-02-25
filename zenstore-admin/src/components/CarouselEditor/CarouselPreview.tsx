import React from "react";
import { CarouselItem } from "../../types/carousel/carouselType";
import clsx from "clsx";

interface CarouselPreviewProps {
  items: CarouselItem[];
}

export const CarouselPreview: React.FC<CarouselPreviewProps> = ({ items }) => {
  if (items.length === 0) {
    return (
      <div className="text-center p-5 bg-light border rounded">
        <p className="mb-0">尚未新增輪播項目</p>
      </div>
    );
  }

  return (
    <div
      id="carouselPreview"
      className="carousel slide"
      data-bs-ride="carousel"
    >
      <div className="carousel-indicators">
        {items.map((_, index) => (
          <button
            key={`indicator-${index}`}
            type="button"
            data-bs-target="#carouselPreview"
            data-bs-slide-to={index}
            className={index === 0 ? "active" : ""}
            aria-current={index === 0 ? "true" : "false"}
            aria-label={`Slide ${index + 1}`}
          ></button>
        ))}
      </div>

      <div className="carousel-inner">
        {items.map((item, index) => (
          <div
            key={item.ID}
            className={`carousel-item ${index === 0 ? "active" : ""}`}
          >
            <div
              className={clsx(
                "row g-0",
                item.POSITION === "right" && "flex-row-reverse"
              )}
            >
              {/* 內容部分 */}
              <div className="col-md-4 d-flex align-items-center">
                <div
                  className="carousel-content p-4 d-flex flex-column align-items-center justify-content-center w-100"
                  style={{
                    color: item.TEXT_COLOR,
                    backgroundColor: item.BACKGROUND_COLOR,
                    height: "99.5%",
                  }}
                >
                  <h2>{item.TITLE}</h2>
                  <p>{item.DESCRIPTION}</p>
                  {item.BUTTON_TEXT && (
                    <a
                      href={item.BUTTON_LINK || "#"}
                      className="btn"
                      style={{
                        backgroundColor: item.TEXT_COLOR,
                        borderColor: item.TEXT_COLOR,
                        color: item.BACKGROUND_COLOR,
                      }}
                    >
                      {item.BUTTON_TEXT}
                    </a>
                  )}
                </div>
              </div>
              {/* 圖片部分 */}
              <div className="col-md-8">
                {item.IMAGE_URL && (
                  <img
                    src={item.IMAGE_URL}
                    className="img-fluid w-100"
                    alt={item.TITLE}
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        className="carousel-control-prev"
        type="button"
        data-bs-target="#carouselPreview"
        data-bs-slide="prev"
      >
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Previous</span>
      </button>
      <button
        className="carousel-control-next"
        type="button"
        data-bs-target="#carouselPreview"
        data-bs-slide="next"
      >
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  );
};

export default CarouselPreview;

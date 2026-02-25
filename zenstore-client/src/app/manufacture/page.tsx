"use client";
import { brandsData } from "@/utils/manufacture";

export default function Manufacture() {
  return (
    <>
      <div className="container-fluid mt-4 ps-4">
        <div className="row">
          <div className="col-12">
            <div className="row row-cols-3 row-cols-md-4 g-3">
              {brandsData &&
                brandsData.map((brand, index) => (
                  <div className="col" key={index}>
                    <div className="d-flex justify-content-center align-items-center ">
                      <img
                        src={brand.imageUrl}
                        alt={brand.brand}
                        className="img-fluid"
                        style={{ maxWidth: "100px", height: "auto" }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

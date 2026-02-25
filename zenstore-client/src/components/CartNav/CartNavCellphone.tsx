const CartNavCellphone = ({ color }: { color: string }) => {
  return (
    <div className="container-fluid ps-3 pt-4">
      <div className="row">
        {/* 步驟 1 */}
        <div className="col d-flex flex-wrap align-items-center justify-content-center position-relative">
          <div className="w-100 d-flex justify-content-center">
            <div
              className="rounded-circle text-white d-flex align-items-center justify-content-center"
              style={{
                backgroundColor: "#203864",
                width: "30px",
                height: "30px",
                zIndex: 2,
              }}
            >
              1
            </div>
          </div>
          <div
            className={`mt-2 ${
              color !== "step-1" ? "text-muted" : "text-danger fw-bold"
            }`}
          >
            確認明細
          </div>
          {/* 連接線 1-2 */}
          <div
            className="position-absolute"
            style={{
              top: "15px",
              left: "50%",
              width: "100%",
              height: "2px",
              backgroundColor: "#58616b",
              zIndex: 1,
            }}
          />
        </div>

        {/* 步驟 2 */}
        <div className="col d-flex flex-wrap align-items-center justify-content-center position-relative">
          <div className="w-100 d-flex justify-content-center">
            <div
              className="rounded-circle text-white d-flex align-items-center justify-content-center"
              style={{
                backgroundColor: "#203864",
                width: "30px",
                height: "30px",
                zIndex: 2,
              }}
            >
              2
            </div>
          </div>
          <div
            className={`mt-2 fw-bold ${
              color !== "step-2" && color !== "step-3"
                ? "text-muted"
                : "text-danger"
            }`}
          >
            填寫資料
          </div>
          {/* 連接線 2-3 */}
          <div
            className="position-absolute"
            style={{
              top: "15px",
              left: "50%",
              width: "100%",
              height: "2px",
              backgroundColor: "#58616b",
              zIndex: 1,
            }}
          />
        </div>

        {/* 步驟 3 */}
        <div className="col d-flex flex-wrap align-items-center justify-content-center position-relative">
          <div className="w-100 d-flex justify-content-center">
            <div
              className="rounded-circle text-white d-flex align-items-center justify-content-center"
              style={{
                backgroundColor: "#203864",
                width: "30px",
                height: "30px",
                zIndex: 2,
              }}
            >
              3
            </div>
          </div>
          <div
            className={`mt-2 fw-bold ${
              color !== "step-4" ? "text-muted" : "text-danger "
            }`}
          >
            最終確認
          </div>
          {/* 連接線 3-4 */}
          <div
            className="position-absolute"
            style={{
              top: "15px",
              left: "50%",
              width: "100%",
              height: "2px",
              backgroundColor: "#58616b",
              zIndex: 1,
            }}
          />
        </div>

        {/* 步驟 4 */}
        <div className="col d-flex flex-wrap align-items-center justify-content-center position-relative">
          <div className="w-100 d-flex justify-content-center">
            <div
              className="rounded-circle text-white d-flex align-items-center justify-content-center"
              style={{
                backgroundColor: "#203864",
                width: "30px",
                height: "30px",
                zIndex: 2,
              }}
            >
              4
            </div>
          </div>
          <div
            className={`mt-2 fw-bold ${
              color !== "step-4" ? "text-muted" : "text-danger"
            }`}
          >
            完成訂購
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartNavCellphone;

const CartNavComputer = ({ color }: { color: string }) => {
  return (
    <div className="container-fluid ps-3 pt-4">
      <div className="row">
        <div className="col g-0">
          <span className="cartDirection cartMargin ms-4">放入購物車</span>
          <span
            className={`${
              color !== "step-1" ? "cartDirection" : "cartDirectionRed"
            }  cartMargin position-relative`}
          >
            <span
              className="cartIndicator border rounded-circle d-inline-block text-white position-absolute px-3 py-2"
              style={{ left: "-1.5rem", top: "0" }}
            >
              1
            </span>
            確認購物明細
          </span>

          <span
            className={`${
              color !== "step-2" ? "cartDirection" : "cartDirectionRed"
            }  cartMargin position-relative`}
          >
            <span
              className="cartIndicator border rounded-circle d-inline-block text-white position-absolute px-3 py-2"
              style={{ left: "-1.5rem", top: "0" }}
            >
              2
            </span>
            填寫收件資料
          </span>

          <span
            className={`${
              color !== "step-3" ? "cartDirection" : "cartDirectionRed"
            }  cartMargin position-relative`}
          >
            <span
              className="cartIndicator border rounded-circle d-inline-block text-white position-absolute px-3 py-2"
              style={{ left: "-1.5rem", top: "0" }}
            >
              3
            </span>
            選擇付款方式
          </span>
          <span
            className={`${
              color !== "step-4" ? "cartDirection" : "cartDirectionRed"
            }  cartMargin position-relative`}
          >
            <span
              className="cartIndicator border rounded-circle d-inline-block text-white position-absolute px-3 py-2"
              style={{ left: "-1.5rem", top: "0" }}
            >
              4
            </span>
            最後確認
          </span>
          <span
            className={`${
              color !== "step-5" ? "cartDirection" : "cartDirectionRed"
            }  `}
          >
            <span
              className="cartIndicator border rounded-circle d-inline-block text-white position-absolute px-3 py-2"
              style={{ left: "-1.5rem", top: "0" }}
            >
              5
            </span>
            完成訂購
          </span>
        </div>
      </div>
    </div>
  );
};

export default CartNavComputer;

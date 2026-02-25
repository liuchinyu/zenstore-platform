export const OrderStatusTransform = (status: string) => {
  switch (status) {
    case "PENDING":
      return <span className="badge bg-warning text-dark">待處理</span>;
    case "PROCESSING":
      return <span className="badge bg-warning text-dark">處理中</span>;
    case "CONFIRMED":
      return <span className="badge bg-warning text-dark">已確認</span>;
    case "COMPLETED":
      return <span className="badge bg-success text-white">已完成</span>;
    case "CANCELLED":
      return <span className="badge bg-danger text-white">已取消</span>;
    case "VOIDED":
      return <span className="badge bg-danger text-white">已作廢</span>;
    default:
      return <span className="badge bg-secondary">{status}</span>;
  }
};

export const PaymentStatusTransform = (status: string) => {
  switch (status) {
    case "UNPAID":
      return <span className="badge bg-danger text-white">未付款</span>;
    case "PENDING_CONFIRMATION":
      return <span className="badge bg-warning text-dark">待確認</span>;
    case "PAID":
      return <span className="badge bg-success text-white">已付款</span>;
    case "PAYMENT_FAILED":
      return <span className="badge bg-danger text-white">付款失敗</span>;
    case "REFUNDING":
      return <span className="badge bg-success text-white">退款中</span>;
    case "REFUNDED":
      return <span className="badge bg-success text-white">已退款</span>;
    case "PAYMENT_TIMEOUT":
      return <span className="badge bg-danger text-white">超過付款時間</span>;

    default:
      return <span className="badge bg-secondary">{status}</span>;
  }
};

export const ShippingStatusTransform = (status: string) => {
  switch (status) {
    case "UNSHIPPED":
      return <span className="badge bg-info text-dark">未出貨</span>;
    case "PREPARING":
      return <span className="badge bg-info text-dark">備貨中</span>;
    case "SHIPPED":
      return <span className="badge bg-success text-white">已出貨</span>;
    case "ARRIVED":
      return <span className="badge bg-primary text-white">已送達</span>;
    case "RETURNING":
      return <span className="badge bg-primary text-white">退貨中</span>;
    case "RETURNED":
      return <span className="badge bg-primary">已退貨</span>;

    default:
      return <span className="badge bg-secondary">{status}</span>;
  }
};

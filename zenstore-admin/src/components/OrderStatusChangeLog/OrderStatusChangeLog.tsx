import React from "react";
import type { OrderStatusChangeLog } from "@/types/orders/order";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import {
  OrderStatusTransform,
  PaymentStatusTransform,
  ShippingStatusTransform,
} from "@/utils/OrderStatusTransform";
import styles from "./OrderStatusChangeLog.module.scss";

interface OrderStatusChangeLogProps {
  logs: OrderStatusChangeLog[];
  isLoading: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const OrderStatusChangeLog: React.FC<OrderStatusChangeLogProps> = ({
  logs,
  isLoading,
  error,
  onRetry,
}) => {
  const getStatusTransform = (changeType: string) => {
    switch (changeType) {
      case "ORDER_STATUS":
        return OrderStatusTransform;
      case "PAYMENT_STATUS":
        return PaymentStatusTransform;
      case "SHIPPING_STATUS":
        return ShippingStatusTransform;
      default:
        return (status: string) => (
          <span className="badge bg-secondary">{status}</span>
        );
    }
  };

  const getChangeTypeLabel = (changeType: string) => {
    switch (changeType) {
      case "ORDER_STATUS":
        return "訂單狀態";
      case "PAYMENT_STATUS":
        return "付款狀態";
      case "SHIPPING_STATUS":
        return "出貨狀態";
      default:
        return changeType;
    }
  };

  if (error) {
    return (
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">狀態變動記錄</h5>
        </div>
        <div className="card-body">
          <div className="text-center">
            <p className="text-danger mb-3">{error}</p>
            {onRetry && (
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={onRetry}
              >
                重新載入
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">狀態變動記錄</h5>
        </div>
        <div className="card-body">
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">載入中...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">狀態變動記錄</h5>
        </div>
        <div className="card-body">
          <p className="text-muted text-center mb-0">尚無狀態變動記錄</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">狀態變動記錄</h5>
        {onRetry && (
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={onRetry}
            title="重新載入"
          >
            <i className="bi bi-arrow-clockwise"></i>
          </button>
        )}
      </div>
      <div className="card-body">
        <div className={styles.timeline}>
          {logs.map((log, index) => {
            const StatusTransform = getStatusTransform(log.status_type);
            return (
              <div key={log.log_id} className={styles.timelineItem}>
                <div className={styles.timelineMarker}></div>
                <div className={styles.timelineContent}>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h6 className="mb-1">
                      {getChangeTypeLabel(log.status_type)}
                    </h6>
                    <small className="text-muted">{log.created_at}</small>
                  </div>
                  <div className={styles.statusChange}>
                    <span className={styles.changeLabel}>從</span>
                    {StatusTransform(log.previous_value)}
                    <span className={styles.changeLabel}>變更為</span>
                    {StatusTransform(log.new_value)}
                  </div>
                  {log.metadata && (
                    <p className={styles.changeInfo}>備註: {log.metadata}</p>
                  )}
                  {log.changed_by && (
                    <p className={styles.changeInfo}>
                      操作人員: {log.changed_by}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderStatusChangeLog;

import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchOrderList } from "@/store/orderSlice";
import { fetchProducts } from "@/store/productSlice";
import { selectOrders } from "@/store/selectors/orderSelector";

export const useContent = () => {
  const dispatch = useAppDispatch();
  const orderList = useAppSelector(selectOrders);
  const { products } = useAppSelector((state) => state.product);

  const [unshippedOrder, setUnshippedOrder] = useState("");

  // 備貨中、未出貨筆數
  const unshippedOrderCount = useMemo(() => {
    return orderList.filter(
      (order: any) =>
        order.SHIPPING_STATUS === "UNSHIPPED" ||
        order.SHIPPING_STATUS === "PREPARING",
    ).length;
  }, [orderList]);

  // 除了訂單已付款之外，其餘皆列為未付款
  const unpaidOrderCount = useMemo(() => {
    return orderList.filter((order: any) => order.PAYMENT_STATUS !== "PAID")
      .length;
  }, [orderList]);

  // 庫存除以最小包裝輛<50組列為需補貨
  const lowStockProductCount = useMemo(() => {
    return products?.filter(
      (product) => product.INVENTORY / product.FIXED_LOT_MULTIPLIER < 50,
    ).length;
  }, [products]);

  const salesFigures = useMemo(() => {
    let total = 0;
    if (orderList.length > 0) {
      orderList.map((order: any) => {
        total += order.FINAL_AMOUNT;
      });
      return total;
    } else {
      return 0;
    }
  }, [orderList]);

  const ordersLength = useMemo(() => {
    if (orderList.length > 0) {
      return orderList.length;
    } else {
      return 0;
    }
  }, [orderList]);

  useEffect(() => {
    if (orderList.length === 0) {
      dispatch(fetchOrderList({ page: 1, pageSize: 100 }));
    }
  }, []);

  useEffect(() => {
    if (products.length === 0) {
      dispatch(fetchProducts({ page: 1, pageSize: 100 }));
    }
  }, []);

  return {
    unshippedOrder,
    setUnshippedOrder,
    unshippedOrderCount,
    unpaidOrderCount,
    lowStockProductCount,
    orderList,
    salesFigures,
    ordersLength,
  };
};

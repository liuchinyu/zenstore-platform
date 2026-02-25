import { useIsMobile } from "@/hooks/useIsMobile";
import dynamic from "next/dynamic";

const CartNavComputer = dynamic(() => import("./CartNavComputer"), {
  ssr: false,
  loading: () => <div className="spinner-border" role="status"></div>,
});

const CartNavCellphone = dynamic(() => import("./CartNavCellphone"), {
  ssr: false,
  loading: () => <div className="spinner-border" role="status"></div>,
});

const CartNav = ({ color }: { color: string }) => {
  const isMobile = useIsMobile();
  return (
    <>
      {isMobile ? (
        <CartNavCellphone color={color} />
      ) : (
        <CartNavComputer color={color} />
      )}
    </>
  );
};

export default CartNav;

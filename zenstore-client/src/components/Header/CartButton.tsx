import { toggleCartModal } from "@/store/cartSlice";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { selectItems } from "@/store/selectors/cartSelectors";

const CartButton = ({ isMobile = false }: { isMobile?: boolean }) => {
  const dispatch = useAppDispatch();
  const { count } = useAppSelector(selectItems);

  const iconSize = isMobile ? "fa-2x" : "fa-3x";
  const badgeClass = isMobile ? "phoneCartBadge" : "cartBadge";
  const buttonClass = isMobile
    ? "btn p-0 pe-1 mb-1 mb-md-0"
    : "btn m-0 p-0 shadow-none border-0";

  return (
    <button className={buttonClass} onClick={() => dispatch(toggleCartModal())}>
      <i className={`bi bi-cart4 ${iconSize} position-relative`}>
        {count > 0 && (
          <span
            className={`position-absolute translate-middle badge rounded-pill text-bg-danger vertical-align-center ${badgeClass}`}
          >
            {count}
            <span className="visually-hidden">unread messages</span>
          </span>
        )}
      </i>
    </button>
  );
};
export default CartButton;

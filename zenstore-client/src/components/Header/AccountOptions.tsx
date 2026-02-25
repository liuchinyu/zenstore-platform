import LoadingLink from "../LoadingLink";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { selectShowAccountMenu } from "@/store/selectors/headerSelectors";
import { selectIsAuthenticated } from "@/store/selectors/authSelectors";
import { setShowAccountMenu } from "../../store/headerSlice";
import { logout } from "../../store/authSlice";
import { useToast } from "@/hooks/useToast";
import { useGlobalLoading } from "@/hooks/useGlobalLoading";

const AccountMenu = ({ isMobile = false }: { isMobile: boolean }) => {
  const dispatch = useAppDispatch();
  const menuStyle = {
    backgroundColor: "#1f4e79",
    minWidth: isMobile ? "180px" : "200px",
    left: isMobile ? "-4.5rem" : "0",
    right: isMobile ? "0" : "auto",
    ...(isMobile && { top: "100%" }),
  };
  const showAccountMenu = useAppSelector(selectShowAccountMenu);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { redirectWithLoading } = useGlobalLoading();
  const { showToast } = useToast();

  const handleLogout = async () => {
    try {
      await dispatch(logout() as any).unwrap();
      dispatch(setShowAccountMenu(false));
      // 為了清除聊天狀態，需使用window.location.href
      redirectWithLoading("/", "登出成功，正在跳轉...", 500);
    } catch (error) {
      console.error("登出失敗", error);
      showToast("登出失敗，請稍後再試", "error");
    }
  };

  return (
    <ul
      className={`${"submenuLevel1"} ${showAccountMenu ? "show" : ""}`}
      style={menuStyle}
    >
      {isAuthenticated ? (
        // 已登入用戶的選單選項
        <>
          <li className="submenuItem">
            <LoadingLink
              href="/account/profile"
              className="dropdown-item"
              onClick={() => dispatch(setShowAccountMenu(false))}
            >
              帳號資料
            </LoadingLink>
          </li>
          <li className="submenuItem">
            <LoadingLink
              href="/account/addresses"
              className="dropdown-item"
              onClick={() => dispatch(setShowAccountMenu(false))}
            >
              收貨人資料管理
            </LoadingLink>
          </li>
          <li className="submenuItem">
            <LoadingLink
              href="/account/orders"
              className="dropdown-item"
              onClick={() => dispatch(setShowAccountMenu(false))}
            >
              訂購記錄
            </LoadingLink>
          </li>
          <li className="submenuItem">
            <LoadingLink
              href="/account/wishlist"
              className="dropdown-item"
              onClick={() => dispatch(setShowAccountMenu(false))}
            >
              收藏清單
            </LoadingLink>
          </li>
          <li className="submenuItem">
            <LoadingLink
              href="/account/coupons"
              className="dropdown-item"
              onClick={() => dispatch(setShowAccountMenu(false))}
            >
              優惠券
            </LoadingLink>
          </li>
          {/* <li className="submenuItem">
                <Link
                  href="/account/messages"
                  className="dropdown-item"
                  onClick={() => dispatch(setShowAccountMenu(false))}
                >
                  訊息中心
                </Link>
              </li> */}
          <li>
            <hr className="dropdown-divider border-white" />
          </li>
          <li className="submenuItem">
            <a
              className="dropdown-item"
              onClick={handleLogout}
              style={{ cursor: "pointer" }}
            >
              登出
            </a>
          </li>
        </>
      ) : (
        // 未登入用戶的選單選項
        <>
          <li className="submenuItem">
            <LoadingLink
              href="/auth/login"
              className="dropdown-item"
              onClick={() => dispatch(setShowAccountMenu(false))}
            >
              登入
            </LoadingLink>
          </li>
          <li className="submenuItem">
            <LoadingLink
              href="/auth/register"
              className="dropdown-item"
              onClick={() => dispatch(setShowAccountMenu(false))}
            >
              註冊
            </LoadingLink>
          </li>
        </>
      )}
    </ul>
  );
};
export default AccountMenu;

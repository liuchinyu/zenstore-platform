import React from "react";

interface NavigationItemProps {
  showOption: boolean;
  children: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  onMouseEnter?: (e: React.MouseEvent) => void;
  showIcon?: boolean;
  iconOnClick?: (e: React.MouseEvent) => void;
}

const NavigationItemMobile = ({
  showOption,
  children,
  onClick,
  onMouseEnter,
  showIcon = true,
  iconOnClick,
}: NavigationItemProps) => {
  return (
    <>
      {/* 手機版本：圖標在外部 */}
      <a
        className={`${
          showOption ? "nav-link text-white d-inline-block" : "d-none"
        }`}
        href="#"
        onClick={onClick}
        onMouseEnter={onMouseEnter}
      >
        {children}
      </a>
      {showIcon && (
        <i
          className={`${
            showOption
              ? `fa-solid fa-chevron-down ms-1 text-white iconHover iconSm`
              : "d-none"
          }`}
          onClick={iconOnClick}
        />
      )}
    </>
  );
};

export default NavigationItemMobile;

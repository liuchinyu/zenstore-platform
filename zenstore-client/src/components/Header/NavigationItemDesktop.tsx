import React from "react";

interface NavigationItemProps {
  children: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  onMouseEnter?: (e: React.MouseEvent) => void;
  showIcon?: boolean;
  iconOnClick?: (e: React.MouseEvent) => void;
}

const NavigationItemDesktop = ({
  children,
  onClick,
  onMouseEnter,
  showIcon = true,
  iconOnClick,
}: NavigationItemProps) => {
  return (
    <a
      className="nav-link text-white"
      href="#"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      {children}
      {showIcon && (
        <i className="fa-solid fa-chevron-down iconSm" onClick={iconOnClick} />
      )}
    </a>
  );
};

export default NavigationItemDesktop;

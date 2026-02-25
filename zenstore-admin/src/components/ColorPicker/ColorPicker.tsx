import React, { useState, useEffect, useRef } from "react";
import clsx from "clsx";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  onChange,
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState(color);
  const [hue, setHue] = useState(0); // 色相值 (0-360)
  const pickerRef = useRef<HTMLDivElement>(null);
  const colorAreaRef = useRef<HTMLDivElement>(null);
  const hueSliderRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const isDraggingHueRef = useRef(false);

  useEffect(() => {
    setCurrentColor(color);
    // 當顏色變更時，更新色相值
    const hslColor = hexToHSL(color);
    setHue(hslColor.h);
  }, [color]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      isDraggingHueRef.current = false;
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCurrentColor(newColor);
    onChange(newColor);

    // 當手動輸入顏色時，更新色相值
    const hslColor = hexToHSL(newColor);
    setHue(hslColor.h);
  };

  const togglePicker = () => {
    setIsOpen(!isOpen);
  };

  // 將 HSL 轉換為 Hex
  const hslToHex = (h: number, s: number, l: number): string => {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  // 將 Hex 轉換為 HSL
  const hexToHSL = (hex: string): { h: number; s: number; l: number } => {
    // 移除 # 符號（如果有）
    hex = hex.replace(/^#/, "");

    // 解析 hex 值
    let r = 0,
      g = 0,
      b = 0;
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16) / 255;
      g = parseInt(hex[1] + hex[1], 16) / 255;
      b = parseInt(hex[2] + hex[2], 16) / 255;
    } else if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16) / 255;
      g = parseInt(hex.substring(2, 4), 16) / 255;
      b = parseInt(hex.substring(4, 6), 16) / 255;
    }

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0,
      l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }

      h *= 60;
    }

    return { h, s: s * 100, l: l * 100 };
  };

  // 處理顏色區域的點擊和拖動
  const handleColorAreaMouseDown = (e: React.MouseEvent) => {
    if (colorAreaRef.current) {
      isDraggingRef.current = true;
      handleColorAreaMove(e);
    }
  };

  // 處理色相滑塊的點擊和拖動
  const handleHueSliderMouseDown = (e: React.MouseEvent) => {
    if (hueSliderRef.current) {
      isDraggingHueRef.current = true;
      handleHueSliderMove(e);
    }
  };

  // 處理顏色區域的移動
  const handleColorAreaMove = (e: React.MouseEvent) => {
    if (isDraggingRef.current && colorAreaRef.current) {
      const rect = colorAreaRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

      // 根據位置計算飽和度和亮度
      const s = x * 100;
      const l = (1 - y) * 100;

      // 使用當前色相和計算出的飽和度、亮度生成新顏色
      const newColor = hslToHex(hue, s, l);
      setCurrentColor(newColor);
      onChange(newColor);
    }
  };

  // 處理色相滑塊的移動
  const handleHueSliderMove = (e: React.MouseEvent) => {
    if (isDraggingHueRef.current && hueSliderRef.current) {
      const rect = hueSliderRef.current.getBoundingClientRect();
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

      // 計算新的色相值 (0-360)
      const newHue = 360 - y * 360;
      setHue(newHue);

      // 根據當前顏色的飽和度和亮度，使用新的色相生成顏色
      const hslColor = hexToHSL(currentColor);
      const newColor = hslToHex(newHue, hslColor.s, hslColor.l);
      setCurrentColor(newColor);
      onChange(newColor);
    }
  };

  // 生成色相條的漸變背景
  const getHueGradient = () => {
    return `linear-gradient(to bottom, 
      #FF0000, /* 紅色 (0°) */
      #FFFF00, /* 黃色 (60°) */
      #00FF00, /* 綠色 (120°) */
      #00FFFF, /* 青色 (180°) */
      #0000FF, /* 藍色 (240°) */
      #FF00FF, /* 紫色 (300°) */
      #FF0000  /* 紅色 (360°) */
    )`;
  };

  // 生成顏色區域的漸變背景
  const getColorAreaGradient = () => {
    // 使用當前色相生成顏色區域的背景
    const pureColor = hslToHex(hue, 100, 50);

    return {
      background: `
        linear-gradient(to right, #FFFFFF, ${pureColor}),
        linear-gradient(to top, #000000, transparent)
      `,
      backgroundBlendMode: "multiply, normal",
    };
  };

  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <div
        className="d-flex align-items-center position-relative"
        ref={pickerRef}
      >
        <div
          className="color-preview me-2"
          style={{
            width: "30px",
            height: "30px",
            backgroundColor: currentColor,
            border: "1px solid #ced4da",
            cursor: "pointer",
            borderRadius: "4px",
          }}
          onClick={togglePicker}
        ></div>
        <input
          type="text"
          className="form-control"
          value={currentColor}
          onChange={handleColorChange}
        />
        {isOpen && (
          <div
            className="position-absolute bg-white p-3 border rounded shadow"
            style={{
              top: "100%",
              left: 0,
              zIndex: 1000,
              width: "260px",
              marginTop: "5px",
            }}
          >
            <div className="d-flex mb-3">
              {/* 顏色選擇區域 */}
              <div
                ref={colorAreaRef}
                style={{
                  width: "220px",
                  height: "200px",
                  position: "relative",
                  cursor: "crosshair",
                  ...getColorAreaGradient(),
                }}
                onMouseDown={handleColorAreaMouseDown}
                onMouseMove={handleColorAreaMove}
              ></div>

              {/* 色相滑塊 */}
              <div
                className="ms-2"
                style={{ position: "relative", width: "20px", height: "200px" }}
              >
                <div
                  ref={hueSliderRef}
                  style={{
                    width: "100%",
                    height: "100%",
                    background: getHueGradient(),
                    cursor: "pointer",
                  }}
                  onMouseDown={handleHueSliderMouseDown}
                  onMouseMove={handleHueSliderMove}
                ></div>
                <div
                  style={{
                    position: "absolute",
                    right: "-3px",
                    top: `${((360 - hue) / 360) * 100}%`,
                    width: "26px",
                    height: "10px",
                    border: "2px solid white",
                    boxShadow: "0 0 2px rgba(0, 0, 0, 0.5)",
                    pointerEvents: "none",
                    transform: "translateY(-50%)",
                  }}
                ></div>
              </div>
            </div>

            {/* 顏色值顯示和控制按鈕 */}
            <div className="d-flex align-items-center mb-2">
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  backgroundColor: currentColor,
                  border: "1px solid #ced4da",
                  marginRight: "10px",
                }}
              ></div>
              <input
                type="text"
                className="form-control form-control-sm"
                value={currentColor}
                onChange={handleColorChange}
              />
            </div>

            <div className="d-flex justify-content-between">
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => {
                  setIsOpen(false);
                  setCurrentColor(color); // 恢復原始顏色
                }}
              >
                取消
              </button>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => {
                  onChange(currentColor);
                  setIsOpen(false);
                }}
              >
                確定
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorPicker;

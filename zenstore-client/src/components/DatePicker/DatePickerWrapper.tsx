// src/components/DatePickerWrapper.tsx
import React, { useEffect } from "react";
import DatePicker, { registerLocale, setDefaultLocale } from "react-datepicker";
import { zhTW } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";

// 註冊並設定預設語言
registerLocale("zh-TW", zhTW);
setDefaultLocale("zh-TW");

interface DatePickerWrapperProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  id: string;
  name: string;
  className?: string;
  dateFormat?: string;
  placeholderText?: string;
  showYearDropdown?: boolean;
  showMonthDropdown?: boolean;
  dropdownMode?: string;
  popperPlacement?: string;
  yearDropdownItemNumber?: number;
  scrollableYearDropdown?: boolean;
  locale?: string;
}

const DatePickerWrapper = ({
  selected,
  onChange,
  id,
  name,
  className = "form-control",
  dateFormat = "yyyy/MM/dd",
  placeholderText = "年/月/日",
  showYearDropdown = true,
  showMonthDropdown = true,
  dropdownMode = "select",
  popperPlacement = "bottom-start",
  yearDropdownItemNumber = 100,
  scrollableYearDropdown = true,
  locale = "zh-TW",
}: DatePickerWrapperProps) => {
  return (
    <DatePicker
      selected={selected}
      onChange={onChange}
      id={id}
      name={name}
      className={className}
      dateFormat={dateFormat}
      placeholderText={placeholderText}
      showYearDropdown={showYearDropdown}
      showMonthDropdown={showMonthDropdown}
      dropdownMode={dropdownMode as any}
      popperPlacement={popperPlacement as any}
      yearDropdownItemNumber={yearDropdownItemNumber}
      scrollableYearDropdown={scrollableYearDropdown}
      locale={locale}
    />
  );
};

export default DatePickerWrapper;

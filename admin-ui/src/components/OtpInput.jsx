import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * OtpInput
 * Props:
 * - length: number of boxes (default 6)
 * - onChange(code: string): fires whenever value changes
 * - onComplete(code: string): fires when all boxes are filled
 * - autoFocus: focus first box on mount (default true)
 * - disabled: disable all inputs
 * - mask: if true, shows • instead of the digit
 * - className: wrapper class for styling
 */
export default function OtpInput({
  length = 6,
  onChange,
  onComplete,
  autoFocus = true,
  disabled = false,
  mask = false,
  className = "",
}) {
  const [values, setValues] = useState(Array.from({ length }, () => ""));
  const inputsRef = useRef([]);

  // keep refs stable length
  inputsRef.current = useMemo(
    () => Array.from({ length }, (_, i) => inputsRef.current[i] || React.createRef()),
    [length]
  );

  useEffect(() => {
    if (autoFocus && !disabled) {
      inputsRef.current[0]?.current?.focus();
    }
  }, [autoFocus, disabled]);

  const focusAt = (index) => {
    const clamped = Math.max(0, Math.min(length - 1, index));
    inputsRef.current[clamped]?.current?.focus();
    inputsRef.current[clamped]?.current?.select?.();
  };

  const emit = (next) => {
    const code = next.join("");
    onChange?.(code);
    if (next.every((c) => c !== "")) {
      onComplete?.(code);
    }
  };

  const handleChange = (e, index) => {
    if (disabled) return;
    const raw = e.target.value;

    // Accept only digits; if user typed multiple (IME/paste into one box), use first digit
    const digits = raw.replace(/\D/g, "");
    if (!digits) return;

    const next = [...values];
    next[index] = digits[0];
    // If more than one digit was entered into a single box, spill over to the right
    let i = index + 1;
    let k = 1;
    while (k < digits.length && i < length) {
      next[i] = digits[k];
      i += 1;
      k += 1;
    }

    setValues(next);
    emit(next);

    // Move focus to next empty (or next index if filled)
    const nextIndex = Math.min(index + digits.length, length - 1);
    focusAt(nextIndex);
  };

  const handleKeyDown = (e, index) => {
    if (disabled) return;

    const key = e.key;

    if (key === "Backspace") {
      e.preventDefault();
      const next = [...values];
      if (next[index]) {
        next[index] = "";
        setValues(next);
        emit(next);
      } else {
        // move left and clear
        const prev = Math.max(0, index - 1);
        if (next[prev]) {
          next[prev] = "";
          setValues(next);
          emit(next);
        }
        focusAt(prev);
      }
    }

    if (key === "ArrowLeft") {
      e.preventDefault();
      focusAt(index - 1);
    }
    if (key === "ArrowRight") {
      e.preventDefault();
      focusAt(index + 1);
    }
    if (key === "Home") {
      e.preventDefault();
      focusAt(0);
    }
    if (key === "End") {
      e.preventDefault();
      focusAt(length - 1);
    }
  };

  const handlePaste = (e, index) => {
    if (disabled) return;

    e.preventDefault();
    const pasted = (e.clipboardData.getData("text") || "").replace(/\D/g, "");
    if (!pasted) return;

    const next = [...values];
    let i = index;
    let k = 0;
    while (i < length && k < pasted.length) {
      next[i] = pasted[k];
      i += 1;
      k += 1;
    }
    setValues(next);
    emit(next);

    // focus next empty or last
    const firstEmpty = next.findIndex((c) => c === "");
    focusAt(firstEmpty === -1 ? length - 1 : firstEmpty);
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={inputsRef.current[i]}
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="one-time-code"
          type={mask ? "password" : "text"}
          value={values[i]}
          disabled={disabled}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={(e) => handlePaste(e, i)}
          onFocus={(e) => e.target.select()}
          maxLength={1}
          aria-label={`OTP Digit ${i + 1}`}
          className="h-12 w-10 text-center rounded-xl border outline-none focus:ring-2 focus:ring-offset-0 focus:ring-indigo-500 text-lg"
        />
      ))}
    </div>
  );
}
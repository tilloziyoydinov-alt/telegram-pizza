interface QuantityControlProps {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function QuantityControl({ value, onIncrement, onDecrement }: QuantityControlProps) {
  return (
    <div className="qty">
      <button className="qty-btn" onClick={onDecrement} aria-label="Kamaytirish">
        −
      </button>
      <span className="qty-value" aria-live="polite">
        {value}
      </span>
      <button className="qty-btn" onClick={onIncrement} aria-label="Ko‘paytirish">
        +
      </button>
    </div>
  );
}

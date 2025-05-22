import { useState } from 'react';

interface CounterProps {
  initialValue?: number;
  label?: string;
}

export function Counter({ initialValue = 0, label = 'Counter' }: CounterProps) {
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);

  return (
    <div className="p-4 border rounded shadow-sm">
      <h2 className="text-lg font-semibold mb-2">{label}</h2>
      <div className="flex items-center gap-4">
        <button 
          onClick={decrement}
          className="px-3 py-1 bg-red-500 text-white rounded"
          aria-label="Decrement"
        >
          -
        </button>
        <span className="text-xl" data-testid="count-value">{count}</span>
        <button 
          onClick={increment}
          className="px-3 py-1 bg-green-500 text-white rounded"
          aria-label="Increment"
        >
          +
        </button>
      </div>
    </div>
  );
} 
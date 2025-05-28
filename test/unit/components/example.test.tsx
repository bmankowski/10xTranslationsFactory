import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

interface ExampleComponentProps {
  onButtonClick?: () => void;
}

// Simple component for testing
const ExampleComponent = ({ onButtonClick }: ExampleComponentProps) => {
  const handleClick =
    onButtonClick ||
    (() => {
      // No-op function
    });

  return (
    <div>
      <h1>Example Component</h1>
      <button onClick={handleClick}>Click me</button>
    </div>
  );
};

describe("Example Component", () => {
  it("renders correctly", () => {
    render(<ExampleComponent />);
    expect(screen.getByRole("heading")).toHaveTextContent("Example Component");
    expect(screen.getByRole("button")).toHaveTextContent("Click me");
  });

  it("calls onButtonClick when button is clicked", async () => {
    const mockOnClick = vi.fn();
    render(<ExampleComponent onButtonClick={mockOnClick} />);

    const button = screen.getByRole("button", { name: /click me/i });
    await userEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});

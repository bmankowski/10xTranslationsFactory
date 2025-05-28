import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Counter } from "../../../src/components/Counter";

describe("Counter Component", () => {
  it("renders with default values", () => {
    render(<Counter />);

    expect(screen.getByRole("heading")).toHaveTextContent("Counter");
    expect(screen.getByTestId("count-value")).toHaveTextContent("0");
    expect(screen.getByRole("button", { name: "Increment" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Decrement" })).toBeInTheDocument();
  });

  it("renders with custom initial value and label", () => {
    render(<Counter initialValue={10} label="Custom Counter" />);

    expect(screen.getByRole("heading")).toHaveTextContent("Custom Counter");
    expect(screen.getByTestId("count-value")).toHaveTextContent("10");
  });

  it("increments the counter when the increment button is clicked", async () => {
    render(<Counter initialValue={0} />);

    const incrementButton = screen.getByRole("button", { name: "Increment" });
    await userEvent.click(incrementButton);

    expect(screen.getByTestId("count-value")).toHaveTextContent("1");

    await userEvent.click(incrementButton);
    expect(screen.getByTestId("count-value")).toHaveTextContent("2");
  });

  it("decrements the counter when the decrement button is clicked", async () => {
    render(<Counter initialValue={10} />);

    const decrementButton = screen.getByRole("button", { name: "Decrement" });
    await userEvent.click(decrementButton);

    expect(screen.getByTestId("count-value")).toHaveTextContent("9");

    await userEvent.click(decrementButton);
    expect(screen.getByTestId("count-value")).toHaveTextContent("8");
  });
});

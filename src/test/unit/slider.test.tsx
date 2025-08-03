import { Slider } from "@/components/ui/slider";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

describe("Slider Component - Unit Tests", () => {
  it("should render with default props", () => {
    render(<Slider />);
    const slider = screen.getByRole("slider");
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute("min", "0");
    expect(slider).toHaveAttribute("max", "100");
    expect(slider).toHaveAttribute("step", "1");
  });

  it("should render with custom props", () => {
    render(<Slider value={50} min={0} max={200} step={5} />);

    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("value", "50");
    expect(slider).toHaveAttribute("min", "0");
    expect(slider).toHaveAttribute("max", "200");
    expect(slider).toHaveAttribute("step", "5");
  });

  it("should call onChange when value changes", () => {
    const handleChange = vi.fn();
    render(<Slider value={25} onChange={handleChange} />);

    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "75" } });

    expect(handleChange).toHaveBeenCalledWith(75);
  });

  it("should handle edge values correctly", () => {
    const handleChange = vi.fn();
    render(<Slider value={50} min={10} max={90} onChange={handleChange} />);

    const slider = screen.getByRole("slider");

    // Test minimum value
    fireEvent.change(slider, { target: { value: "10" } });
    expect(handleChange).toHaveBeenCalledWith(10);

    // Test maximum value
    fireEvent.change(slider, { target: { value: "90" } });
    expect(handleChange).toHaveBeenCalledWith(90);
  });

  it("should apply custom className", () => {
    render(<Slider className="custom-slider" />);
    const sliderContainer = screen.getByRole("slider").parentElement;
    expect(sliderContainer).toHaveClass("custom-slider");
  });

  it("should calculate percentage correctly", () => {
    render(<Slider value={25} min={0} max={100} />);
    const slider = screen.getByRole("slider");

    // The slider should show 25% progress
    const progressBar = slider.parentElement?.querySelector(
      '[style*="width: 25%"]'
    );
    expect(progressBar).toBeInTheDocument();
  });

  it("should handle decimal values", () => {
    const handleChange = vi.fn();
    render(
      <Slider value={0.5} min={0} max={1} step={0.1} onChange={handleChange} />
    );

    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "0.7" } });

    expect(handleChange).toHaveBeenCalledWith(0.7);
  });

  it("should be keyboard accessible", () => {
    const handleChange = vi.fn();
    render(<Slider value={50} onChange={handleChange} />);

    const slider = screen.getByRole("slider");
    slider.focus();

    // Test arrow key navigation
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    fireEvent.keyDown(slider, { key: "ArrowUp" });
    fireEvent.keyDown(slider, { key: "ArrowLeft" });
    fireEvent.keyDown(slider, { key: "ArrowDown" });

    // Test Home/End keys
    fireEvent.keyDown(slider, { key: "Home" });
    fireEvent.keyDown(slider, { key: "End" });
  });

  it("should forward ref correctly", () => {
    const ref = vi.fn();
    render(<Slider ref={ref} />);

    expect(ref).toHaveBeenCalled();
  });

  it("should handle disabled state", () => {
    render(<Slider disabled />);
    const slider = screen.getByRole("slider");

    expect(slider).toBeDisabled();
  });

  it("should apply track and thumb custom classes", () => {
    render(
      <Slider trackClassName="custom-track" thumbClassName="custom-thumb" />
    );

    const slider = screen.getByRole("slider");
    const container = slider.parentElement;

    expect(container?.querySelector(".custom-track")).toBeInTheDocument();
    expect(container?.querySelector(".custom-thumb")).toBeInTheDocument();
  });
});

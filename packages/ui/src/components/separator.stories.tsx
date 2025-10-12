import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "@storybook/test";

import { Separator } from "./separator";

const meta = {
  component: Separator,
  title: "UI/Separator",
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  args: {
    orientation: "horizontal",
  },
  play: async ({ canvasElement }) => {
    const separators = canvasElement.querySelectorAll(
      '[data-slot="separator-root"][data-orientation="horizontal"]',
    );

    expect(separators.length).toBe(1);
  },
  render: (args) => (
    <div className="space-y-4">
      <div className="text-sm">Section one</div>
      <Separator {...args} />
      <div className="text-sm">Section two</div>
    </div>
  ),
};

export const Vertical: Story = {
  args: {
    orientation: "vertical",
  },
  play: async ({ canvasElement }) => {
    const separators = canvasElement.querySelectorAll(
      '[data-slot="separator-root"][data-orientation="vertical"]',
    );

    expect(separators.length).toBe(1);
  },
  render: (args) => (
    <div className="flex h-24 items-center">
      <span className="text-sm">Left</span>
      <Separator className="mx-4 h-16" {...args} />
      <span className="text-sm">Right</span>
    </div>
  ),
};

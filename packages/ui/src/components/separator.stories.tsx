import type { Meta, StoryObj } from "@storybook/react-vite";

import { Separator } from "./separator";

const meta = {
  component: Separator,
  tags: ["autodocs"],
  title: "UI/Separator",
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: (args) => (
    <div className="space-y-4">
      <div className="text-sm">Section one</div>
      <Separator {...args} />
      <div className="text-sm">Section two</div>
    </div>
  ),
  args: {
    orientation: "horizontal",
  },
};

export const Vertical: Story = {
  render: (args) => (
    <div className="flex h-24 items-center">
      <span className="text-sm">Left</span>
      <Separator className="mx-4 h-16" {...args} />
      <span className="text-sm">Right</span>
    </div>
  ),
  args: {
    orientation: "vertical",
  },
};

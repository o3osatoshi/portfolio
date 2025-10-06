import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

const meta = {
  component: Tooltip,
  tags: ["autodocs"],
  title: "UI/Tooltip",
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover me</Button>
      </TooltipTrigger>
      <TooltipContent>Tooltip content</TooltipContent>
    </Tooltip>
  ),
};

export const DelayAndPlacement: Story = {
  args: {
    delayDuration: 200,
  },
  render: (args) => (
    <Tooltip {...args}>
      <TooltipTrigger asChild>
        <Button variant="ghost">Focus me</Button>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        Appears after a short delay
      </TooltipContent>
    </Tooltip>
  ),
};

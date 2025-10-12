import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "@storybook/test";

import { Button } from "./button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

const meta = {
  component: Tooltip,
  title: "UI/Tooltip",
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.hover(canvas.getByRole("button", { name: "Hover me" }));

    const content = await body.findByText("Tooltip content", {
      selector: "[data-slot='tooltip-content']",
    });

    await waitFor(() => {
      expect(content).toBeVisible();
    });
  },
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.hover(canvas.getByRole("button", { name: "Focus me" }));

    const content = await body.findByText("Appears after a short delay", {
      selector: "[data-slot='tooltip-content']",
    });

    await waitFor(() => {
      expect(content).toBeVisible();
    });
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

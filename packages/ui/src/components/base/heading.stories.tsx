import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "@storybook/test";

import { Heading } from "./heading";

const meta = {
  args: {
    align: "left",
    children: "Design System",
    level: "h2",
  },
  argTypes: {
    align: {
      control: "inline-radio",
      options: ["left", "center", "right"],
    },
    level: {
      control: "select",
      options: ["h1", "h2", "h3", "h4", "h5", "h6"],
    },
  },
  component: Heading,
  tags: ["autodocs"],
  title: "UI/Base/Heading",
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByRole("heading", {
      name: "Design System",
      level: 2,
    });

    expect(heading).toBeVisible();
  },
};

export const Levels: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const level of [1, 2, 3, 4, 5, 6]) {
      const heading = canvas.getByRole("heading", {
        name: `Heading level ${level}`,
        level,
      });

      expect(heading).toBeVisible();
    }
  },
  render: () => (
    <div className="space-y-3">
      <Heading level="h1">Heading level 1</Heading>
      <Heading level="h2">Heading level 2</Heading>
      <Heading level="h3">Heading level 3</Heading>
      <Heading level="h4">Heading level 4</Heading>
      <Heading level="h5">Heading level 5</Heading>
      <Heading level="h6">Heading level 6</Heading>
    </div>
  ),
};

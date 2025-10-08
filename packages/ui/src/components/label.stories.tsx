import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "@storybook/test";

import { Input } from "./input";
import { Label } from "./label";

const meta = {
  component: Label,
  tags: ["autodocs"],
  title: "UI/Label",
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("Email address");

    expect(input).toHaveAttribute("placeholder", "you@example.com");
  },
  render: () => (
    <div className="flex flex-col gap-2">
      <Label htmlFor="email">Email address</Label>
      <Input id="email" placeholder="you@example.com" type="email" />
    </div>
  ),
};

export const WithDescription: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("Username");

    expect(input).toHaveAttribute("placeholder", "o3osatoshi");
    expect(
      canvas.getByText("This name will be displayed on your public profile."),
    ).toBeVisible();
  },
  render: () => (
    <div className="flex flex-col gap-2">
      <Label htmlFor="username">Username</Label>
      <p className="text-muted-foreground text-sm">
        This name will be displayed on your public profile.
      </p>
      <Input id="username" placeholder="o3osatoshi" />
    </div>
  ),
};

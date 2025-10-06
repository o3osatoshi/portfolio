import type { Meta, StoryObj } from "@storybook/react-vite";

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
  render: () => (
    <div className="flex flex-col gap-2">
      <Label htmlFor="email">Email address</Label>
      <Input id="email" placeholder="you@example.com" type="email" />
    </div>
  ),
};

export const WithDescription: Story = {
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

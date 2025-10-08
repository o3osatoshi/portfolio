import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "@storybook/test";

import { Button } from "./button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

const meta = {
  component: Card,
  tags: ["autodocs"],
  title: "UI/Card",
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.getByText("Project Snapshot")).toBeVisible();
    expect(canvas.getByRole("button", { name: "View Details" })).toBeVisible();
  },
  render: () => (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Project Snapshot</CardTitle>
        <CardDescription>Concise summary of portfolio metrics.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          Card content can be anything from charts to descriptive text. Keep the
          layout flexible by stacking elements inside this slot.
        </p>
      </CardContent>
      <CardFooter className="border-t">
        <Button variant="secondary">View Details</Button>
      </CardFooter>
    </Card>
  ),
};

export const WithAction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.getByRole("button", { name: "Manage" })).toBeVisible();
    expect(canvas.getByText("Plan")).toBeVisible();
    expect(canvas.getByText("Pro")).toBeVisible();
  },
  render: () => (
    <Card className="w-full max-w-md">
      <CardHeader className="border-b pb-6">
        <CardTitle>Subscription</CardTitle>
        <CardAction>
          <Button size="sm" variant="outline">
            Manage
          </Button>
        </CardAction>
        <CardDescription>
          Manage billing and usage controls for your current plan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-2 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Plan</dt>
            <dd>Pro</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Seats</dt>
            <dd>5 active</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  ),
};

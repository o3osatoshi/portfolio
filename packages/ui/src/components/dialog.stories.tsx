import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "@storybook/test";

import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { Input } from "./input";

const meta = {
  component: Dialog,
  title: "UI/Dialog",
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole("button", { name: "Open dialog" }));

    const title = await body.findByRole("heading", {
      name: "Edit profile",
      level: 2,
    });

    await waitFor(() => {
      expect(title).toBeVisible();
    });

    await waitFor(() => {
      expect(body.getByLabelText("Display name")).toHaveValue("o3osatoshi");
    });
  },
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile information. Click save when you're
            done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <label className="font-medium text-sm" htmlFor="username">
            Display name
          </label>
          <Input id="username" defaultValue="o3osatoshi" />
        </div>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const WithLongContent: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      canvas.getByRole("button", { name: "Show release notes" }),
    );

    const title = await body.findByRole("heading", {
      name: "What's new",
      level: 2,
    });

    await waitFor(() => {
      expect(title).toBeVisible();
    });
    await waitFor(() => {
      expect(body.getByText("Version 2.4.0")).toBeVisible();
    });
  },
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Show release notes</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[70vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>What's new</DialogTitle>
          <DialogDescription>Version 2.4.0</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <p>
            This update brings improved performance across dashboard pages and a
            refreshed charting experience with more granular tooltips.
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Optimised database queries for faster load times.</li>
            <li>Added keyboard shortcuts for quick navigation.</li>
            <li>Updated theming tokens to better support dark mode.</li>
            <li>Fixed bugs reported in the last release cycle.</li>
          </ul>
        </div>
        <DialogFooter>
          <Button>Got it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

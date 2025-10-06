import * as React from "react";
import { ChevronDown } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible";

const meta = {
  component: Collapsible,
  tags: ["autodocs"],
  title: "UI/Collapsible",
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Collapsible className="w-full max-w-md space-y-2" {...args}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Stack trace</h3>
        <CollapsibleTrigger asChild>
          <Button size="sm" variant="outline">
            Toggle
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="rounded-md border bg-muted/40 p-3 text-xs">
        <code className="block whitespace-pre-wrap text-left">
          {`Error: Something went wrong\n    at fetchUser (/app/src/api/users.ts:58:11)\n    at processTicksAndRejections (node:internal/process/task_queues:95:5)`}
        </code>
      </CollapsibleContent>
    </Collapsible>
  ),
  args: {
    defaultOpen: false,
  },
};

export const Controlled: Story = {
  render: (args) => {
    const [open, setOpen] = React.useState(false);

    return (
      <Collapsible
        className="w-full max-w-md space-y-2"
        open={open}
        onOpenChange={setOpen}
        {...args}
      >
        <CollapsibleTrigger asChild>
          <Button className="inline-flex items-center gap-2" variant="ghost">
            Debug log
            <ChevronDown
              className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="rounded-md border bg-muted/40 p-3 text-xs">
          <code className="block whitespace-pre-wrap text-left">
            {`POST /api/authenticate 401 (Unauthorized)\nRetrieving a fresh token and retrying request...`}
          </code>
        </CollapsibleContent>
      </Collapsible>
    );
  },
};

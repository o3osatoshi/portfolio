"use client";

import { Trash2 } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button/button";

export default function Delete() {
  return (
    <Button variant="ghost" size="icon">
      <Trash2 />
    </Button>
  );
}

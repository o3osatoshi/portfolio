import { redirect } from "next/navigation";
import { getPathName } from "@/utils/path";

export default function Page() {
  redirect(getPathName("core-crud"));
}

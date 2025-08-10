import { getPathName } from "@/utils/handle-nav";
import { redirect } from "next/navigation";

export default function Page() {
  redirect(getPathName("labs-server-crud"));
}

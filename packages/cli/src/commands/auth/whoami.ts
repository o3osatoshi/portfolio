import { fetchMe } from "../../lib/api-client";

export async function runAuthWhoami(): Promise<void> {
  const me = await fetchMe();
  console.log(JSON.stringify(me, null, 2));
}

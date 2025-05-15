export async function GET() {
  return new Response("Hello, world!", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}

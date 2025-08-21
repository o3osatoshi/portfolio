export function logSampleMessage(): void {
  console.log("Hello from domain package! with bundle!");
}

export function logCustomMessage(message: string): void {
  console.log(`Domain package says: ${message} with bundle!`);
}

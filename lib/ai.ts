export function suggestCategory(taskName: string) {
  const text = taskName.toLowerCase();

  if (
    text.includes("code") ||
    text.includes("study") ||
    text.includes("read")
  ) {
    return "growth";
  }

  if (
    text.includes("youtube") ||
    text.includes("tiktok") ||
    text.includes("instagram")
  ) {
    return "waste";
  }

  return "neutral";
}
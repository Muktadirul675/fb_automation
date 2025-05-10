import toast from "react-hot-toast";
import { Status } from "~/types";

export function getBadgeClass(status: string) {
  switch (status) {
    case Status.success:
      return "badge badge-success";
    case Status.pending:
      return "badge badge-pending";
    case Status.error:
      return "badge badge-error";
    case Status.queued:
      return "badge badge-queued";
    default:
      return "badge";
  }
};

export function getPaginationPages(current: number, total: number): (number | string)[] {
  const delta = 2;
  const range: (number | string)[] = [];

  for (let i = 1; i <= total; i++) {
    if (
      i === 1 ||
      i === total ||
      (i >= current - delta && i <= current + delta)
    ) {
      range.push(i);
    } else if (
      (i === current - delta - 1 && i > 1) ||
      (i === current + delta + 1 && i < total)
    ) {
      range.push("...");
    }
  }

  // Remove duplicate "..."
  return range.filter((item, idx, arr) => {
    return item !== "..." || arr[idx - 1] !== "...";
  });
}

export function getRandomItems<T>(arr: T[], n: number): T[] | undefined {
  if (n > arr.length) {
    toast.error("n can't be larger than the array length");
    return;
  }

  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

export function getTimeLeftString(scheduledFor: string) {
  const now = new Date();
  const scheduled = new Date(scheduledFor);
  const diff = scheduled.getTime() - now.getTime();

  if (diff <= 0) return "Now";

  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  if (minutes > 1) return `${minutes} minutes`;
  if (minutes === 1) return `1 minute`;
  return `${seconds} seconds`;
}

export function truncate(text: string, count: number = 50): string {
  if (text.length <= count) {
    return text;
  }
  return text.slice(0, count) + '...';
}

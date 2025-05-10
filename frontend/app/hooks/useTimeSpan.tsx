import { useEffect, useState } from "react";

type TimeDiff = {
  value: number;
  unit: "seconds" | "minutes" | "hours";
};

function getTimeDiff(targetDate: Date): TimeDiff {
  const now = new Date();
  const diff = Math.max(0, targetDate.getTime() - now.getTime());

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours >= 1) {
    return {
      value: hours,
      unit: "hours",
    };
  }

  if (minutes >= 1) {
    return {
      value: minutes,
      unit: "minutes",
    };
  }

  return {
    value: seconds,
    unit: "seconds",
  };
}

export function useTimeSpan(targetDate: Date): string {
  const [timeLeft, setTimeLeft] = useState(() => getTimeDiff(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeDiff(targetDate));
    }, 1000); // Always check every second to catch unit transitions

    return () => clearInterval(interval);
  }, [targetDate]);

  return `${timeLeft.value} ${timeLeft.unit} left`;
}
import React from "react";
import { Status } from "~/types";

interface StatusBadgeProps {
  status: Status;
}

const statusToClass: Record<Status, string> = {
  [Status.pending]: "status-pending",
  [Status.error]: "status-error",
  [Status.queued]: "status-queued",
  [Status.success]: "status-success",
  [Status.published]: "status-published",
  [Status.running]: "status-running",
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <span className={`badge ${statusToClass[status]}`}>
      {status}
    </span>
  );
};
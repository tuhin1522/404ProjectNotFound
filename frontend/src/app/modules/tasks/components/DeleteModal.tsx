"use client";

import { Task } from "@/app/types/tasks";
import { useTaskStore } from "@/app/modules/tasks/store/useTaskStore";
import { useEffect, useRef } from "react";
import { swalConfirm, swalError, swalSuccess } from "@/app/lib/utils/swal";

interface DeleteModalProps {
  task: Task;
  onClose: () => void;
}

export default function DeleteModal({ task, onClose }: DeleteModalProps) {
  const { removeTask } = useTaskStore();
  const hasPromptedRef = useRef(false);

  useEffect(() => {
    if (hasPromptedRef.current) return;
    hasPromptedRef.current = true;

    const promptDelete = async () => {
      const confirmed = await swalConfirm({
        title: "Delete task?",
        text: `This will permanently delete \"${task.title}\".`,
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
      });

      if (!confirmed) {
        onClose();
        return;
      }

      try {
        await removeTask(task.id);
        await swalSuccess({ title: "Task deleted" });
      } catch {
        await swalError({
          title: "Delete failed",
          text: "Please try again.",
        });
      } finally {
        onClose();
      }
    };

    void promptDelete();
  }, [task, removeTask, onClose]);

  return null;
}

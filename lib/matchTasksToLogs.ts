export function matchTasksToLogs(tasks: any[], logs: any[]) {
  return tasks.map((task) => {
    const taskText = task.title.toLowerCase();

    const match = logs.find((log) => {
      const logText = (log.title || log.content || "").toLowerCase();

      return (
        logText.includes(taskText) ||
        taskText.includes(logText)
      );
    });

    return {
      ...task,
      matched: !!match,
      matchedLog: match || null,
    };
  });
}
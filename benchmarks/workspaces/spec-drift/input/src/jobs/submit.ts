export interface NotificationProvider {
  send(jobId: string): Promise<void>;
}

interface Job {
  jobId: string;
  key: string;
  completedAt?: number;
}

export function createJobService(provider: NotificationProvider) {
  const jobs: Job[] = [];
  const retentionDays = 7;

  function nextId() {
    return `job-${jobs.length + 1}`;
  }

  return {
    submitJob(key: string) {
      const job = { jobId: nextId(), key };
      jobs.push(job);
      return { status: 201, body: { jobId: job.jobId } };
    },
    async completeJob(jobId: string, now: number) {
      const job = jobs.find((entry) => entry.jobId === jobId);
      if (!job) throw new Error("unknown job");
      job.completedAt = now;
      await provider.send(jobId);
    },
    expireJobs(now: number) {
      const cutoff = now - retentionDays * 24 * 60 * 60 * 1000;
      for (let index = jobs.length - 1; index >= 0; index--) {
        const completedAt = jobs[index]!.completedAt;
        if (completedAt !== undefined && completedAt <= cutoff) jobs.splice(index, 1);
      }
    },
    count: () => jobs.length,
  };
}

import { createJobService, type NotificationProvider } from "./jobs/submit.ts";

export function createApi(provider: NotificationProvider) {
  const service = createJobService(provider);
  return {
    postJob(request: { key: string }) {
      return service.submitJob(request.key);
    },
    completeJob: service.completeJob,
    expireJobs: service.expireJobs,
    count: service.count,
  };
}

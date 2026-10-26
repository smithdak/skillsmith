import { createApi } from "./src/api.ts";

const sent: string[] = [];
const api = createApi({ send: async (id) => { sent.push(id); } });
const first = api.postJob({ key: "order-42" });
if (first.status !== 201 || first.body.jobId !== "job-1") throw new Error("submission failed");
await api.completeJob(first.body.jobId, 0);
if (sent[0] !== first.body.jobId) throw new Error("provider was not called");
api.expireJobs(7 * 24 * 60 * 60 * 1000);
if (api.count() !== 0) throw new Error("seven-day expiry failed");

console.log("Local fake-provider checks passed; production delivery was not exercised.");

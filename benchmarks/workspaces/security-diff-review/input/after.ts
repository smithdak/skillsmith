type Session = { tenantId: string };
type Report = { id: string; tenantId: string; content: string };
declare const db: { find(id: string, tenantId?: string): Promise<Report | undefined> };

async function loadReport(id: string, session: Session) {
  return db.find(id);
}

export async function download(id: string, session: Session) {
  const report = await loadReport(id, session);
  if (!report || report.tenantId !== session.tenantId) throw new Error("not found");
  return report.content;
}

export async function preview(id: string, session: Session) {
  const report = await loadReport(id, session);
  if (!report) throw new Error("not found");
  return report.content.slice(0, 200);
}

import { auth } from "@/lib/auth";
import { ActivityRepository } from "@/repositories/activity.repository";

type ActivityFile = {
  fileId: string;
  name: string;
  contentType: string;
  url?: string;
  data?: Buffer | { buffer: ArrayBufferLike };
};

export async function GET(
  _request: Request,
  context: RouteContext<"/api/activities/[activityId]/files/[fileId]">
) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  if (session.user.role !== "teacher" && session.user.role !== "admin") {
    return new Response("Forbidden", { status: 403 });
  }

  const { activityId, fileId } = await context.params;
  const email = String(session.user.email || "").trim().toLowerCase();
  const activity = session.user.role === "admin"
    ? await ActivityRepository.findById(activityId)
    : await ActivityRepository.findByIdForAdvisor(activityId, email);

  if (!activity) return new Response("Not found", { status: 404 });

  const files = (activity as { attachments?: ActivityFile[] }).attachments || [];
  const file = files.find((item) => item.fileId === fileId);
  if (!file) return new Response("Not found", { status: 404 });
  if (file.url) return Response.redirect(file.url);
  if (!file.data) return new Response("Not found", { status: 404 });

  const bytes = Buffer.isBuffer(file.data)
    ? file.data
    : Buffer.from(file.data.buffer);
  const body = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;
  const safeName = file.name.replace(/["\r\n]/g, "_");
  const disposition = file.contentType.startsWith("image/") ||
    file.contentType === "application/pdf"
    ? "inline"
    : "attachment";

  return new Response(body, {
    headers: {
      "Content-Type": file.contentType,
      "Content-Length": String(bytes.length),
      "Content-Disposition": `${disposition}; filename*=UTF-8''${encodeURIComponent(safeName)}`,
      "Cache-Control": "private, no-store"
    }
  });
}

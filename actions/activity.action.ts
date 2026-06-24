"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CLASS_LEVEL_OPTIONS } from "@/lib/student-options";
import {
  deleteCloudinaryAsset,
  uploadToCloudinary
} from "@/lib/cloudinary";
import {
  ActivityRepository,
  type ActivityAttachmentData,
  type ActivityData
} from "@/repositories/activity.repository";

const ACTIVITY_PATH = "/dashboard/activity";

async function requireTeacherOrAdmin() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "teacher" && session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return session.user;
}

function value(formData: FormData, name: string) {
  return String(formData.get(name) || "").trim();
}

async function getAttachments(formData: FormData): Promise<ActivityAttachmentData[]> {
  const documentFiles = formData.getAll("documentFiles");
  const imageFiles = formData.getAll("imageFiles");
  const attachments: ActivityAttachmentData[] = [];
  for (const [kind, entries] of [
    ["document", documentFiles],
    ["image", imageFiles]
  ] as const) {
    for (const entry of entries) {
      if (!(entry instanceof File) || entry.size === 0) continue;
      const uploaded = await uploadToCloudinary(entry, {
        folder: `smart-advisor/activities/${kind === "image" ? "images" : "documents"}`,
        kind
      });
      if (!uploaded) continue;
      attachments.push({
        fileId: uploaded.publicId,
        name: uploaded.originalName,
        contentType: entry.type || "application/octet-stream",
        size: uploaded.bytes,
        publicId: uploaded.publicId,
        url: uploaded.url,
        resourceType: uploaded.resourceType,
        kind,
      });
    }
  }

  return attachments;
}

function getActivityData(
  formData: FormData,
  advisorEmail: string,
  attachments: ActivityAttachmentData[]
): ActivityData {
  return {
    classLevel: value(formData, "classLevel"),
    major: value(formData, "major"),
    weekNumber: value(formData, "weekNumber"),
    duration: value(formData, "duration"),
    topic: value(formData, "topic"),
    objectives: value(formData, "objectives"),
    activitySteps: value(formData, "activitySteps"),
    evaluation: value(formData, "evaluation"),
    activityResults: value(formData, "activityResults"),
    problems: value(formData, "problems"),
    followUpStudents: value(formData, "followUpStudents"),
    attachments,
    suggestions: value(formData, "suggestions"),
    advisorEmail
  };
}

function assertRequiredFields(data: ActivityData) {
  if (
    !data.classLevel ||
    !data.major ||
    !data.weekNumber ||
    !data.duration ||
    !data.topic
  ) {
    throw new Error("Class, major, week, duration, and topic are required.");
  }

  if (!CLASS_LEVEL_OPTIONS.includes(data.classLevel)) {
    throw new Error("Invalid class level.");
  }
}

export async function createActivityAction(formData: FormData) {
  const user = await requireTeacherOrAdmin();
  const advisorEmail = String(user.email || "").trim().toLowerCase();
  const attachments = await getAttachments(formData);
  const data = getActivityData(formData, advisorEmail, attachments);

  assertRequiredFields(data);
  await ActivityRepository.create(data);
  revalidatePath(ACTIVITY_PATH);
  redirect(ACTIVITY_PATH);
}

export async function updateActivityAction(
  id: string,
  formData: FormData
) {
  const user = await requireTeacherOrAdmin();
  const advisorEmail = String(user.email || "").trim().toLowerCase();
  const current = user.role === "admin"
    ? await ActivityRepository.findById(id)
    : await ActivityRepository.findByIdForAdvisor(id, advisorEmail);

  if (!current) {
    throw new Error("ไม่พบกิจกรรมหรือไม่มีสิทธิ์เข้าถึงข้อมูลนี้");
  }

  const existingAttachments =
    ((current as { attachments?: ActivityAttachmentData[] }).attachments || []);
  const removedIds = new Set(
    formData.getAll("removeAttachmentIds").map((item) => String(item))
  );
  const removedAttachments = existingAttachments.filter(
    (attachment) => removedIds.has(attachment.fileId)
  );
  const keptAttachments = existingAttachments.filter(
    (attachment) => !removedIds.has(attachment.fileId)
  );
  const newAttachments = await getAttachments(formData);
  const attachments = [...keptAttachments, ...newAttachments];

  const data = getActivityData(formData, advisorEmail, attachments);

  assertRequiredFields(data);

  if (user.role === "admin") {
    const activityData: Partial<ActivityData> = { ...data };
    delete activityData.advisorEmail;
    await ActivityRepository.updateById(id, activityData);
  } else {
    await ActivityRepository.updateByIdForAdvisor(
      id,
      advisorEmail,
      data
    );
  }

  await Promise.all(
    removedAttachments.map((attachment) =>
      deleteCloudinaryAsset(attachment.publicId, attachment.resourceType)
    )
  );

  revalidatePath(ACTIVITY_PATH);
  redirect(ACTIVITY_PATH);
}

export async function deleteActivityAction(id: string) {
  const user = await requireTeacherOrAdmin();
  const advisorEmail = String(user.email || "").trim().toLowerCase();

  const activity = user.role === "admin"
    ? await ActivityRepository.findById(id)
    : await ActivityRepository.findByIdForAdvisor(id, advisorEmail);
  const attachments =
    ((activity as { attachments?: ActivityAttachmentData[] } | null)?.attachments || []);

  if (user.role === "admin") {
    await ActivityRepository.deleteById(id);
  } else {
    await ActivityRepository.deleteByIdForAdvisor(
      id,
      advisorEmail
    );
  }

  await Promise.all(
    attachments.map((attachment) =>
      deleteCloudinaryAsset(attachment.publicId, attachment.resourceType)
    )
  );

  revalidatePath(ACTIVITY_PATH);
  redirect(ACTIVITY_PATH);
}

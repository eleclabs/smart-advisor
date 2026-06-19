"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CLASS_LEVEL_OPTIONS } from "@/lib/student-options";
import {
  ActivityRepository,
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

function getActivityData(
  formData: FormData,
  advisorEmail: string
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
    supportingDocuments: value(formData, "supportingDocuments"),
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
  const data = getActivityData(formData, advisorEmail);

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
  const data = getActivityData(formData, advisorEmail);

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

  revalidatePath(ACTIVITY_PATH);
  redirect(ACTIVITY_PATH);
}

export async function deleteActivityAction(id: string) {
  const user = await requireTeacherOrAdmin();
  const advisorEmail = String(user.email || "").trim().toLowerCase();

  if (user.role === "admin") {
    await ActivityRepository.deleteById(id);
  } else {
    await ActivityRepository.deleteByIdForAdvisor(
      id,
      advisorEmail
    );
  }

  revalidatePath(ACTIVITY_PATH);
  redirect(ACTIVITY_PATH);
}

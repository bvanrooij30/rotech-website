/**
 * Forms Store - Opslaan van website formulieren voor sync met Admin Portal.
 * Contact forms, offerte aanvragen, etc.
 */

import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const FORMS_FILE = path.join(DATA_DIR, "form-submissions.json");

export type FormType = "contact" | "offerte" | "quote" | "support";

export interface FormSubmission {
  id: string;
  formType: FormType;
  
  // Contact info
  name: string;
  email: string;
  phone?: string;
  company?: string;
  
  // Content
  subject?: string;
  message: string;
  
  // Extra data (JSON)
  extraData?: Record<string, unknown>;
  
  // Status
  status: "new" | "in_progress" | "done" | "archived";
  
  // Sync
  syncedToAdmin: boolean;
  adminFormId?: number;
  
  // Timestamps
  submittedAt: string;
  updatedAt: string;
}

interface FormsData {
  submissions: FormSubmission[];
  lastUpdated: string;
}

async function ensureDataDir(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

async function readForms(): Promise<FormsData> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(FORMS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return { 
      submissions: [], 
      lastUpdated: new Date().toISOString()
    };
  }
}

async function writeForms(data: FormsData): Promise<void> {
  await ensureDataDir();
  data.lastUpdated = new Date().toISOString();
  await fs.writeFile(FORMS_FILE, JSON.stringify(data, null, 2), "utf-8");
}

/**
 * Store a new form submission
 */
export async function storeFormSubmission(
  submission: Omit<FormSubmission, "id" | "status" | "syncedToAdmin" | "submittedAt" | "updatedAt">
): Promise<FormSubmission> {
  const data = await readForms();
  
  const newSubmission: FormSubmission = {
    ...submission,
    id: `form_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    status: "new",
    syncedToAdmin: false,
    submittedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  data.submissions.unshift(newSubmission);
  await writeForms(data);
  
  console.log(`Form submission stored: ${newSubmission.formType} from ${newSubmission.email}`);
  return newSubmission;
}

/**
 * Get form submissions with optional filters
 */
export async function getFormSubmissions(options?: {
  unsynced?: boolean;
  formType?: FormType;
  status?: string;
  limit?: number;
}): Promise<FormSubmission[]> {
  const data = await readForms();
  let submissions = data.submissions;
  
  if (options?.unsynced) {
    submissions = submissions.filter(s => !s.syncedToAdmin);
  }
  
  if (options?.formType) {
    submissions = submissions.filter(s => s.formType === options.formType);
  }
  
  if (options?.status) {
    submissions = submissions.filter(s => s.status === options.status);
  }
  
  if (options?.limit) {
    submissions = submissions.slice(0, options.limit);
  }
  
  return submissions;
}

/**
 * Mark submissions as synced
 */
export async function markFormsSynced(
  submissionIds: string[],
  adminFormIds: Record<string, number>
): Promise<void> {
  const data = await readForms();
  
  for (const submission of data.submissions) {
    if (submissionIds.includes(submission.id)) {
      submission.syncedToAdmin = true;
      submission.adminFormId = adminFormIds[submission.id];
      submission.updatedAt = new Date().toISOString();
    }
  }
  
  await writeForms(data);
}

/**
 * Update submission status
 */
export async function updateFormStatus(
  submissionId: string,
  status: FormSubmission["status"]
): Promise<void> {
  const data = await readForms();
  const submission = data.submissions.find(s => s.id === submissionId);
  
  if (submission) {
    submission.status = status;
    submission.updatedAt = new Date().toISOString();
    await writeForms(data);
  }
}

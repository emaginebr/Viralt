/** Submission Types -- Types for the contest submission system */

/** Main submission information */
export interface SubmissionInfo {
  submissionId: number;
  campaignId: number;
  clientId: number;
  fileUrl: string;
  fileType: number;
  caption: string | null;
  status: number;
  voteCount: number;
  judgeScore: number | null;
  submittedAt: string;
}

/** Data required to create a new submission (no ID) */
export interface SubmissionInsertInfo {
  campaignId: number;
  clientId: number;
  fileUrl: string;
  fileType: number;
  caption: string | null;
}

/** Submission list API result */
export interface SubmissionListResult {
  submissions: SubmissionInfo[];
  sucesso: boolean;
  mensagem: string | null;
  erros: string[] | null;
}

/** Submission get API result */
export interface SubmissionGetResult {
  submission: SubmissionInfo | null;
  sucesso: boolean;
  mensagem: string | null;
  erros: string[] | null;
}

/** Status-only result */
export interface SubmissionStatusResult {
  sucesso: boolean;
  mensagem: string;
  erros: string[] | null;
}

/** Submission status enum values */
export enum SubmissionStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
}

/** Submission file type enum values */
export enum SubmissionFileType {
  Image = 0,
  Video = 1,
}

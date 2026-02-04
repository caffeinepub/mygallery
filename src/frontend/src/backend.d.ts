import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Note {
    id: bigint;
    title: string;
    content: string;
    createdAt: Time;
    updatedAt: Time;
}
export interface PaginatedFiles {
    files: Array<FileMetadata>;
    hasMore: boolean;
}
export interface Mission {
    id: bigint;
    tasks: Array<Task>;
    title: string;
    created: bigint;
    owner: Principal;
}
export type Time = bigint;
export interface FileMetadata {
    id: string;
    owner: Principal;
    blob: ExternalBlob;
    name: string;
    createdAt: Time;
    size: bigint;
    mimeType: string;
    folderId?: bigint;
}
export interface UserProfile {
    name: string;
}
export interface UploadResponse {
    id: string;
}
export interface Task {
    task: string;
    completed: boolean;
    taskId: bigint;
}
export interface DiagnosticResult {
    cycles: bigint;
    build: string;
}
export interface Folder {
    id: bigint;
    owner: Principal;
    name: string;
    createdAt: Time;
}
export enum SortDirection {
    asc = "asc",
    desc = "desc"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createFolder(name: string): Promise<string | null>;
    createMission(title: string, tasks: Array<Task>): Promise<bigint>;
    createNote(title: string, content: string): Promise<bigint>;
    deleteFile(id: string): Promise<void>;
    deleteFiles(fileIds: Array<string>): Promise<void>;
    deleteFolder(folderId: bigint): Promise<void>;
    deleteMission(missionId: bigint): Promise<void>;
    deleteNote(noteId: bigint): Promise<void>;
    /**
     * / Admin-only method to get all files regardless of owner
     */
    getAllFiles(): Promise<Array<FileMetadata>>;
    getAllFolders(): Promise<Array<Folder>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDiagnostics(): Promise<DiagnosticResult>;
    getFile(fileId: string): Promise<FileMetadata | null>;
    getFilesInFolder(folderId: bigint, offset: bigint, limit: bigint): Promise<PaginatedFiles>;
    getMission(missionId: bigint): Promise<Mission | null>;
    getNote(noteId: bigint): Promise<Note | null>;
    getPaginatedFiles(sortDirection: SortDirection, offset: bigint, limit: bigint): Promise<PaginatedFiles>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listMissions(): Promise<Array<Mission>>;
    listNotes(): Promise<Array<Note>>;
    moveFileToFolder(fileId: string, folderId: bigint): Promise<void>;
    moveFilesToFolder(fileIds: Array<string>, folderId: bigint): Promise<void>;
    removeFromFolder(fileId: string): Promise<void>;
    renameFolder(folderId: bigint, newName: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateMission(missionId: bigint, newTitle: string, newTasks: Array<Task>): Promise<void>;
    updateNote(noteId: bigint, newTitle: string, newContent: string): Promise<void>;
    uploadFile(name: string, mimeType: string, size: bigint, blob: ExternalBlob): Promise<UploadResponse>;
}

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
export interface Mission {
    id: bigint;
    tasks: Array<Task>;
    title: string;
    created: bigint;
    owner: Principal;
}
export interface PaginatedFiles {
    files: Array<FileMetadata>;
    hasMore: boolean;
}
export interface UserProfile {
    name: string;
}
export type Time = bigint;
export interface UploadResponse {
    id: string;
}
export interface FileMetadata {
    id: string;
    fileLocation?: string;
    owner: Principal;
    blob?: ExternalBlob;
    link?: string;
    name: string;
    createdAt: Time;
    size: bigint;
    mimeType: string;
    missionId?: bigint;
    folderId?: bigint;
}
export interface Task {
    task: string;
    completed: boolean;
    taskId: bigint;
}
export interface HealthResult {
    time: bigint;
    cycles: bigint;
    build: string;
}
export interface TaskStatusUpdate {
    completed: boolean;
    taskId: bigint;
}
export interface DiagnosticResult {
    time: bigint;
    deleteFilesLowLevelTime: bigint;
    cycles: bigint;
    deleteFolderTime: bigint;
    build: string;
    moveFilesToFolderTime: bigint;
    uploadTime: bigint;
}
export interface TaskView {
    task: string;
    completed: boolean;
    taskId: bigint;
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
    batchRemoveFromFolder(fileIds: Array<bigint>): Promise<void>;
    createFolder(name: string): Promise<string | null>;
    createLink(name: string, url: string, folderId: bigint | null, missionId: bigint | null): Promise<UploadResponse>;
    createMission(title: string, tasks: Array<Task>): Promise<bigint>;
    deleteFile(id: bigint): Promise<void>;
    deleteFiles(fileIds: Array<bigint>): Promise<void>;
    deleteFilesLowLevel(fileIds: Array<bigint>): Promise<void>;
    deleteFolder(folderId: bigint): Promise<void>;
    deleteMission(missionId: bigint): Promise<void>;
    /**
     * / Admin-only method to get all files regardless of owner
     */
    getAllFiles(): Promise<Array<FileMetadata>>;
    getAllFolders(): Promise<Array<Folder>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDiagnostics(): Promise<DiagnosticResult>;
    getFile(fileId: bigint): Promise<FileMetadata | null>;
    getFilesForMission(missionId: bigint | null): Promise<Array<FileMetadata>>;
    getFilesInFolder(folderId: bigint, offset: bigint, limit: bigint): Promise<PaginatedFiles>;
    getHealth(): Promise<HealthResult>;
    getLinksForUser(user: Principal): Promise<Array<FileMetadata>>;
    getMission(missionId: bigint): Promise<Mission | null>;
    getPaginatedFiles(sortDirection: SortDirection, offset: bigint, limit: bigint): Promise<PaginatedFiles>;
    getTasks(missionId: bigint): Promise<Array<TaskView>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listMissions(): Promise<Array<Mission>>;
    moveFileToFolder(fileId: bigint, folderId: bigint): Promise<void>;
    moveFilesToFolder(fileIds: Array<bigint>, folderId: bigint): Promise<void>;
    moveFilesToMission(fileIds: Array<bigint>, missionId: bigint): Promise<void>;
    removeFromFolder(fileId: bigint): Promise<void>;
    renameFolder(folderId: bigint, newName: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    toggleTaskCompletionStatus(missionId: bigint, taskStatusUpdate: TaskStatusUpdate): Promise<void>;
    updateMission(missionId: bigint, newTitle: string, newTasks: Array<Task>): Promise<void>;
    uploadFile(name: string, mimeType: string, size: bigint, blob: ExternalBlob, missionId: bigint | null): Promise<UploadResponse>;
}

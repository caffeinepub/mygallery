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
export interface PaginatedFiles {
    files: Array<FileMetadata>;
    hasMore: boolean;
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
export interface Folder {
    id: bigint;
    owner: Principal;
    name: string;
    createdAt: Time;
}
export interface UploadResponse {
    id: string;
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
    deleteFile(id: string): Promise<void>;
    deleteFiles(fileIds: Array<string>): Promise<void>;
    deleteFolder(folderId: bigint): Promise<void>;
    /**
     * / New method to get all files regardless of owner
     */
    getAllFiles(): Promise<Array<FileMetadata>>;
    getAllFolders(): Promise<Array<Folder>>;
    getCallerUserRole(): Promise<UserRole>;
    getFile(fileId: string): Promise<FileMetadata | null>;
    getFilesInFolder(folderId: bigint, offset: bigint, limit: bigint): Promise<PaginatedFiles>;
    getPaginatedFiles(sortDirection: SortDirection, offset: bigint, limit: bigint): Promise<PaginatedFiles>;
    isCallerAdmin(): Promise<boolean>;
    moveFileToFolder(fileId: string, folderId: bigint): Promise<void>;
    moveFilesToFolder(fileIds: Array<string>, folderId: bigint): Promise<void>;
    removeFromFolder(fileId: string): Promise<void>;
    renameFolder(folderId: bigint, newName: string): Promise<void>;
    uploadFile(name: string, mimeType: string, size: bigint, blob: ExternalBlob): Promise<UploadResponse>;
}

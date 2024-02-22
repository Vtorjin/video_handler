export enum DownloadState {
    'downloading' = 2,
    'completed' = 1,
    'initial' = 0,
    error = 3
}

export type IsSuccessful = DownloadState.completed;

export type StatusUnion = DownloadState.complete | DownloadState.downloading | DownloadState.initial;
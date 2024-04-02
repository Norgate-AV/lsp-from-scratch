export type DocumentUri = string;
type DocumentBody = string;

export interface TextDocumentIdentifier {
    uri: DocumentUri;
}

export interface VersionedTextDocumentIdentifier
    extends TextDocumentIdentifier {
    version: number;
}

export interface TextDocumentContentChangedEvent {
    text: string;
}

export const documents = new Map<DocumentUri, DocumentBody>();

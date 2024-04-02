import { NotificationMessage } from "../../server";
import {
    documents,
    VersionedTextDocumentIdentifier,
    TextDocumentContentChangedEvent,
} from "../../documents";
import log from "../../log";

interface DidChangeTextDocumentParams {
    textDocument: VersionedTextDocumentIdentifier;
    contentChanges: Array<TextDocumentContentChangedEvent>;
}

export function didChange(message: NotificationMessage): void {
    const params = message.params as DidChangeTextDocumentParams;

    documents.set(params.textDocument.uri, params.contentChanges[0].text);
}

import { RequestMessage } from "../../server";
import { Range } from "../../types";
import log from "../../log";
import { TextDocumentIdentifier, documents } from "../../documents";

interface DocumentDiagnosticsParams {
    textDocument: TextDocumentIdentifier;
}

namespace DiagnosticSeverity {
    export const Error: 1 = 1;
    export const Warning: 2 = 2;
    export const Information: 3 = 3;
    export const Hint: 4 = 4;
}

type DiagnosticSeverity = 1 | 2 | 3 | 4;

export interface Diagnostic {
    range: Range;
    severity: DiagnosticSeverity;
    source: "LSP From Scratch";
    message: string;
}

interface FullDocumentDiagnosticReport {
    kind: "full";
    items: Array<Diagnostic>;
}

export function diagnostic(
    message: RequestMessage
): FullDocumentDiagnosticReport | null {
    const params = message.params as DocumentDiagnosticsParams;
    const content = documents.get(params.textDocument.uri);

    if (!content) {
        return null;
    }

    log.write({ content });

    const items: Array<Diagnostic> = [];

    const lines = content.split("\n");

    return {
        kind: "full",
        items,
    };
}

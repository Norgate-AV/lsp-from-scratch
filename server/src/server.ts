import log from "./log";
import { exit } from "./methods/exit";
import { initialize } from "./methods/initialize";
import { shutdown } from "./methods/shutdown";
import { diagnostic } from "./methods/textDocument/diagnostic";
import { didChange } from "./methods/textDocument/didChange";
import { didOpen } from "./methods/textDocument/didOpen";

interface Message {
    jsonrpc: string;
}

export interface NotificationMessage extends Message {
    method: string;
    params?: Array<unknown> | object;
}

export interface RequestMessage extends NotificationMessage {
    id: number | string;
}

type NotificationMethod = (message: NotificationMessage) => void;

type RequestMethod = (
    message: RequestMessage
) => ReturnType<typeof initialize> | ReturnType<typeof diagnostic>;

const methods: Record<string, RequestMethod | NotificationMethod> = {
    exit,
    initialize,
    shutdown,
    "textDocument/didChange": didChange,
    "textDocument/didOpen": didOpen,
    "textDocument/diagnostic": diagnostic,
};

function respond(id: RequestMessage["id"], result: unknown) {
    const message = JSON.stringify({ id, result });
    const length = Buffer.byteLength(message, "utf-8");
    const header = `Content-Length: ${length}\r\n\r\n`;

    const payload = header + message;

    log.write(payload);
    process.stdout.write(payload);
}

let buffer = "";
process.stdin.on("data", (chunk) => {
    buffer += chunk;

    while (true) {
        const match = buffer.match(/Content-Length: (\d+)\r\n/);

        if (!match) {
            break;
        }

        const length = parseInt(match[1], 10);
        const start = buffer.indexOf("\r\n\r\n") + 4;

        if (buffer.length < start + length) {
            break;
        }

        const message = JSON.parse(buffer.slice(start, start + length));
        log.write({
            id: message.id,
            method: message.method,
        });

        const method = methods[message.method];

        if (method) {
            const result = method(message);

            if (result !== undefined) {
                respond(message.id, result);
            }
        }

        buffer = buffer.slice(start + length);
    }
});

import log from "./log";
import { initialize } from "./methods/initialize";

interface Message {
    jsonrpc: string;
}

export interface RequestMessage extends Message {
    id: number | string;
    method: string;
    params?: Array<unknown> | object;
}

type RequestMethod = (message: RequestMessage) => object;

const methods: Record<string, RequestMethod> = {
    initialize,
};

const respond = (id: RequestMessage["id"], result: unknown) => {
    const message = JSON.stringify({ id, result });
    const length = Buffer.byteLength(message, "utf-8");
    const header = `Content-Length: ${length}\r\n\r\n`;

    const payload = header + message;

    log.write(payload);
    process.stdout.write(payload);
};

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
            respond(message.id, method(message));
        }

        buffer = buffer.slice(start + length);
    }
});

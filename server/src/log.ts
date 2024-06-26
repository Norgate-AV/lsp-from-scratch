import * as fs from "fs";

const log = fs.createWriteStream("/tmp/server.log");

function write(message: object | unknown) {
    if (typeof message === "object") {
        log.write(JSON.stringify(message));
    } else {
        log.write(message);
    }

    log.write("\n");
}

export default {
    write,
};

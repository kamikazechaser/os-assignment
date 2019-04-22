const debug = require("debug")("messaging-system");
const Capq = require("capq");
const WebSocket = require("ws");

const queue = new Capq({ capacity: 2, autopop: true });
const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", (socket, req) => {
    if (queue.full()) {
        debug("messaging system is full");
        return socket.send("messaging system is full");
    }

    debug(`${(req.connection.remoteAddress).split(":").pop()} connected to the messaging system`);
    debug(`${queue.capacity() - queue.length()} slots remaining in the messaging system`);
    queue.lfix(req.connection.remoteAddress);

    return socket.on("message", msg => {
        return wss.clients.forEach(function each(client) {
            return client.send(`${(req.connection.remoteAddress).split(":").pop()} => ${msg}`);
        });
    });
});
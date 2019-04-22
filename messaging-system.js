const debug = require("debug")("messaging-system");
const Capq = require("capq");
const WebSocket = require("ws");

const queue = new Capq({ capacity: 2, autopop: false });
const wss = new WebSocket.Server({ port: 80, verifyClient: checkQueue });

function checkQueue(check, done) {
    if (queue.full()) {
        debug("messaging system is full");
        return done(false, 401, null, null);
    }

    return done(true);
}

wss.on("connection", (socket, req) => {
    debug(`${(req.connection.remoteAddress).split(":").pop()} connected to the messaging system`);
    debug(`${queue.capacity() - queue.length()} slots remaining in the messaging system`);
    queue.lfix(req.connection.remoteAddress);

    return socket.on("message", msg => {
        debug(`${(req.connection.remoteAddress).split(":").pop()} => ${msg}`);
        return wss.clients.forEach(function each(client) {
            return client.send(`${(req.connection.remoteAddress).split(":").pop()} => ${msg}`);
        });
    });
});
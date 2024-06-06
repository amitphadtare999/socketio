import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';
// import cors from "cors";
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

const app = express();
const port = 3000;
const server = createServer(app);

const io = new Server(server, { cors: { origin: "http://localhost:5173", methods: ["GET", "POST"], credentials: true } });

io.use((socket, next) => {
    console.log('User trying to connect: ', socket.id);

    cookieParser()(socket.request, socket.request.res, (err) => {
        if (err) return next(err);

        const { token } = socket.request.cookies;
        if (!token) return next(new Error('Authentication error'));

        const decoded = jwt.verify(token, 'secret');
        next();

        // if (token) {
        //     jwt.verify(token, 'secret', (err, decoded) => {
        //         if (err) {
        //             return next(new Error('Authentication error'));
        //         }
        //         socket.decoded = decoded;
        //         next();
        //     });
        // } else {
        //     next(new Error('Authentication error'));
        // }
    });
});
io.on('connection', (socket) => {
    console.log('New user connected: ', socket.id);

    // socket.emit("welcome", "Welcome to the socket io server.");

    // socket.broadcast.emit("welcome", `New user connected ${socket.id}`); // Send message to all socket expect this one.

    socket.on("message", ({ message, room }) => {
        // io.emit("message-received", message);
        io.to([room]).emit("message-received", message);
    })

    socket.on('join-room', (room) => {
        socket.join(room);
    });

    socket.on("disconnect", () => {
        console.log("Socket disconnected ", socket.id);
    })
})
app.get('/', (req, res) => {
    return res.json({ message: 'Welcome to socket io server.' })
});

app.get('/login', (req, res) => {
    const token = jwt.sign({ id: "asdfdsfasfdsg" }, 'secret');

    res.cookie('token', token, { httpOnly: true, sameSite: 'none', secure: true });
    res.json({ message: 'Login successful' })
})
server.listen(port, () => {
    console.log('Server is listening on ', port);
})
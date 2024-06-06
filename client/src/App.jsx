import { useEffect, useMemo, useState } from 'react';
import { io } from "socket.io-client";
import { Box, Button, Card, Container, Divider, List, ListItem, ListItemText, TextField, Typography } from "@mui/material";

export default function App() {
  const socket = useMemo(() => {
    return io("http://localhost:3000", { withCredentials: true });
  }, []);

  const [message, setMessage] = useState("");
  const [room, setRoom] = useState("");
  const [socketId, setSocketId] = useState('');
  const [messages, setMessages] = useState([]);
  const [roomName, setRoomName] = useState('');

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Socket connected", socket.id);
      setSocketId(socket.id);

      socket.on("welcome", (s) => {
        console.log("Welcome message received from socket server: ", s);
      });

      socket.on("message-received", (newMessage) => {
        // console.log("Message received from socket server: ", newMessage);
        setMessages(oldState => [...oldState, newMessage]);
      });

      return () => {
        socket.disconnect();
      }
    })
  }, []);


  const handleSubmit = (e) => {
    e.preventDefault();
    const message = e.target[0].value;
    socket.emit("message", { message, room });
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    socket.emit("join-room", roomName);
  };


  return (
    <Container maxWidth="sm">


      <Card variant="outlined" >
        <Box sx={{ p: 2 }}>
          <Typography variant='h4' component="div" gutterBottom>
            Welcome
          </Typography>
          <Divider />
          <form onSubmit={handleJoinRoom}>
            <TextField value={roomName} onChange={(e) => setRoomName(e.target.value)} label="Join Room" variant='outlined' />
            <Button variant="contained" type="submit" color='primary'>Send</Button>
          </form>
          <Divider />
          <form onSubmit={handleSubmit}>
            <TextField value={message} onChange={(e) => setMessage(e.target.value)} label="Message" variant='outlined' />
            <TextField value={room} onChange={(e) => setRoom(e.target.value)} label="Room Id" variant='outlined' />
            <Button variant="contained" type="submit" color='primary'>Send</Button>
          </form>

          <Divider />
          <Typography component="div" gutterBottom>
            Messages: {socketId}
            <List>
              {messages.map((item, index) => {
                return (<ListItem key={index}>
                  <ListItemText>{item}</ListItemText>
                </ListItem>)
              })}
            </List>
          </Typography>
        </Box>
      </Card>


    </Container>
  )
}

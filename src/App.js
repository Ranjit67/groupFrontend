import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import { v1 as uuid } from "uuid";
import Video from "./Video";

export default function App() {
  const uui = uuid();
  const [textField, settextField] = useState();
  // const [visibul, setvisibul] = useState(false);
  const [peers, setPeers] = useState([]);
  const [message, setmessage] = useState("");
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);
  // const ref = useRef();
  useEffect(() => {
    socketRef.current = io.connect("http://localhost:4000/");

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        userVideo.current.srcObject = stream;
        socketRef.current.emit("uui", uui);
        socketRef.current.on("all user", (users) => {
          const peers = [];
          // console.log(users.length);
          const { userInThisRoom, id } = users;
          socketRef.current.emit("id", id);
          userInThisRoom.forEach((userID) => {
            // console.log(userID);
            const peer = createPeer(userID, socketRef.current.id, stream);
            peersRef.current.push({
              peerID: userID,
              peer,
            });
            peers.push(peer);
          });
          setPeers(peers);
          // console.log(users);
        });
        socketRef.current.on("global send", (id) => {
          console.log(id);
        });
        socketRef.current.on("user join", (paylod) => {
          const peer = addPeer(paylod.signal, paylod.hostId, stream);
          peersRef.current.push({
            peerID: paylod.hostId,
            peer,
          });
          setPeers((user) => [...user, peer]);
        });

        socketRef.current.on("receiving returning signal", (paylod) => {
          const item = peersRef.current.find((p) => p.peerID === paylod.id);
          item.peer.signal(paylod.userToHost);
        });

        socketRef.current.on("take leave", (id) => {
          console.log({ leave: id.id });
        });
      });

    //end useEEffect
  }, []);

  const addPeer = (hostSignal, callerID, stream) => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });
    peer.on("signal", (signal) => {
      socketRef.current.emit("returning signal", { signal, callerID });
    });

    peer.signal(hostSignal);

    return peer;
  };
  const createPeer = (remoteSocketid, selfId, stream) => {
    // console.log(remoteSocketid);
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });
    peer.on("signal", (signal) => {
      socketRef.current.emit("sanding signal", {
        signal,
        remoteSocketid,
        selfId,
      });
    });

    return peer;
  };
  const handelTextField = (e) => {
    settextField(e.target.value);
  };
  const contactPerson = () => {
    socketRef.current.emit("uui", textField);
  };
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <input type="text" placeholder="name" />
      <video
        width="420"
        height="315"
        ref={userVideo}
        muted
        autoPlay
        playsInline
      />
      {uui}
      <br />

      <input type="text" onChange={handelTextField} />
      <br />
      <button onClick={contactPerson}>contact</button>
      <br />
      {peers.map((peer, index) => {
        return <Video key={index} peer={peer} />;
      })}

      {message}
    </div>
  );
}

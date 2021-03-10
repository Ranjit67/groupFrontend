import { useEffect, useRef } from "react";
import Peer from "simple-peer";
const Video = (props) => {
  const ref = useRef();

  useEffect(() => {
    props.peer.on("stream", (stream) => {
      ref.current.srcObject = stream;
    });
  }, []);

  return (
    <div style={{ display: "inline-block" }}>
      <video playsInline autoPlay ref={ref} width="420" height="315" />
    </div>
  );
};
export default Video;

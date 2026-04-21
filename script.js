const socket = io();

let localStream;
let peerConnection;

const servers = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" }
    ]
};

async function joinCall() {
    const roomId = document.getElementById("roomId").value;

    socket.emit("join-room", roomId);

    localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    });

    document.getElementById("localVideo").srcObject = localStream;

    socket.on("user-connected", async () => {
        createPeerConnection();
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        socket.emit("offer", offer);
    });

    socket.on("offer", async (offer) => {
        createPeerConnection();
        await peerConnection.setRemoteDescription(offer);

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        socket.emit("answer", answer);
    });

    socket.on("answer", async (answer) => {
        await peerConnection.setRemoteDescription(answer);
    });

    socket.on("ice-candidate", async (candidate) => {
        if (peerConnection) {
            await peerConnection.addIceCandidate(candidate);
        }
    });
}

function createPeerConnection() {
    peerConnection = new RTCPeerConnection(servers);

    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    peerConnection.ontrack = event => {
        document.getElementById("remoteVideo").srcObject = event.streams[0];
    };

    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            socket.emit("ice-candidate", event.candidate);
        }
    };
}
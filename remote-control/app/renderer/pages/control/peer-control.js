const EventEmitter = require('events');
const peer = new EventEmitter();

// 以下应该是peer-puppet
const {ipcRenderer ,desktopCapturer} = require('electron');

// async function getScreenStream() {
//     const sources = await desktopCapturer.getSources({types: ['screen']});

//     navigator.getUserMedia({
//         audio: false,
//         video: {
//             mandatory: {
//                 chromeMediaSource: 'desktop',
//                 chromeMediaSourceId: sources[0].id,
//                 maxWidth: window.screen.width,
//                 maxHeight: window.screen.height
//             }
//         }
//     }, (stream) => {
//         peer.emit('add-stream', stream);
//     }, (err) => {
//         //handle err
//         console.error(err)
//     });
// }
// getScreenStream()

// peer.on('robot', (type, data) => {
//     if (type === 'mouse') {
//         data.screen = {
//             width: window.screen.width,
//             height: window.screen.height
//         }
//     }
//     setTimeout(() => {
//         ipcRenderer.send('robot', type, data);
//     }, 2000);
    
// })

const pc = new window.RTCPeerConnection({})
const dc = pc.createDataChannel('robotchannel', {reliable: false});
dc.onopen = function () {
    peer.on('robot', (type, data) => {
        dc.send(JSON.stringify({type, data}));
    });
}

dc.onmessage = function(event) {
    console.log('message', event);
}

dc.onerror = function(e) {
    console.log('error', e)
}
// onicecandiate iceEvent
// addIceCandiate
pc.onicecandidate = function(e) {
    if (e.candidate && JSON.stringify(e.candidate) !== '{}') {
        console.log('control-candidate', JSON.stringify(e.candidate));
        ipcRenderer.send('forward', 'control-candidate', JSON.stringify(e.candidate));
    }
    
}

ipcRenderer.on('candidate', (e, candidate) => {
    console.log('co-can', candidate);
    addIceCandidate(JSON.parse(candidate.data));
})

let candidates = [];
async function addIceCandidate(candidate) {
    if (candidate) {
        candidates.push(candidate);
    }
    if (pc.remoteDescription && pc.remoteDescription.type) {
        for(let i = 0; i < candidates.length; i++) {
            await pc.addIceCandidate(new RTCIceCandidate(candidates[i]));
        }
        candidates = [];
    }
}

// window.addIceCandidate = addIceCandidate;

async function createOffer() {
    let offer = await pc.createOffer({
        offerToReceiveAudio: false,
        offerToReceiveVideo: true
    })
    await pc.setLocalDescription(offer)
    console.log('create-offer\n', JSON.stringify(pc.localDescription))
    return pc.localDescription
}
createOffer().then((offer) => {
    ipcRenderer.send('forward', 'offer', {type: offer.type, sdp: offer.sdp});
});
async function setRemote(answer) {
    await pc.setRemoteDescription(answer.data)
    console.log('create-answer', pc)
}

ipcRenderer.on('answer', (e, answer) => {
    console.log('answer', answer)
    setRemote(answer);
});

// window.setRemote = setRemote

pc.onaddstream = (e) => {
	console.log('addstream', e)
	peer.emit('add-stream', e.stream)

}

module.exports = peer;
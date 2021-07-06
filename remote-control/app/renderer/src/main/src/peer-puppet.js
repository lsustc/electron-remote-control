// createAnswer
// addstream
import {desktopCapturer, ipcRenderer} from 'electron';
async function getScreenStream() {
    const sources = await desktopCapturer.getSources({types: ['screen']});
    return new Promise((resolve, reject) => {
        navigator.getUserMedia({
            audio: false,
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: sources[0].id,
                    maxWidth: window.screen.width,
                    maxHeight: window.screen.height
                }
            }
        }, (stream) => {
            resolve(stream);
            // peer.emit('add-stream', stream);
        }, (err) => {
            //handle err
            reject(err)
            // console.error(err)
        });
    });
    
}
const pc = new window.RTCPeerConnection({})

pc.ondatachannel = (e) => {
    console.log('datachannel', e);
    e.channel.onmessage = (e) => {
        let {type, data} = JSON.parse(e.data);
            if (type === 'mouse') {
                data.screen = {
                    width: window.screen.width,
                    height: window.screen.height
                }
            }
            ipcRenderer.send('robot', type, data);

    }
}

pc.onicecandidate = function(e) {
    if (e.candidate && JSON.stringify(e.candidate) !== '{}') {
        console.log('puppet-candidate', JSON.stringify(e.candidate));
        ipcRenderer.send('forward', 'puppet-candidate', JSON.stringify(e.candidate));
    }
    
}

ipcRenderer.on('candidate', (e, candidate) => {
    console.log('pu-can', candidate);
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

window.addIceCandidate = addIceCandidate;
ipcRenderer.on('offer', async (e, offer) => {
    let answer = await createAnswer(offer);
    ipcRenderer.send('forward', 'answer', {type: answer.type, sdp: answer.sdp})
});
async function createAnswer(offer) {
    let screenStream = await getScreenStream();

    console.log('offer', offer);
    pc.addStream(screenStream);
    await pc.setRemoteDescription(offer.data);
    await pc.setLocalDescription(await pc.createAnswer());
    console.log('answer', JSON.stringify(pc.localDescription));
    return pc.localDescription;
}

window.createAnswer = createAnswer;
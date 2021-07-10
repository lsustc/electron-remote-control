const WebSocket = require('ws');
const EventEmitter = require('events');
const signal = new EventEmitter();

const ws = new WebSocket('ws://81.68.110.197:8010');
// const ws = new WebSocket('ws://111.231.59.178:8010'); // 填你自己的地址，这个是我的服务器，不一定可用

ws.on('open', function open() {
    console.log('connect success')
})

ws.on('message', function incoming(message) {
    let data = JSON.parse(message)
    console.log('data', data, message);
    signal.emit(data.event, data.data)
})


function send(event, data) {
    console.log('sended', {event, data})
    ws.send(JSON.stringify({event, data}))
}

function invoke(event, data, answerEvent) {
    return new Promise((resolve, reject) => {
        send(event, data)
        signal.once(answerEvent, resolve)
        setTimeout(() => {
            reject('timeout')
        }, 5000)
    })
}
signal.send = send
signal.invoke = invoke

module.exports = signal

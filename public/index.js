let myName;
let socket;

window.onload = async () => {
  while(1) {
    myName = prompt('이름 입력');

    if (myName === '') {
      alert('이름 입력 필수');
    } else {
      const { data: { result } } = await axios.get(`/check?name=${myName}`);
      if (result) {
        socket = io();
        socket.emit('enter', myName);
        break;
      } else {
        alert('이름 중복');
      }
    }
  }

  socket.on('enter', name => {
    const message = `"${name}"님이 입장하였습니다. [${now()}]`;
    const color = 'green';
    addMessage(message, color);
  });

  socket.on('msg', (name, msg) => {
    console.log(`${name}: ${msg}`);
    const message = `${name}: ${msg} [${now()}]`;
    addMessage(message);
  });

  socket.on('leave', name => {
    console.log('leave::', name);
    const message = `"${name}"님이 퇴장하였습니다. [${now()}]`;
    const color = 'red';
    addMessage(message, color);
  });
};

const sendMessage = event => {
  event.preventDefault();

  const msg = document.getElementById('msg').value;
  socket.emit('msg', msg);
  document.getElementById('msg').value = '';
};

const addMessage = (msg, color = 'black') => {
  const chat = document.createElement('div');
  chat.style.color = color;
  chat.innerText = msg;
  document.getElementById('chat').appendChild(chat);
};

const now = () => moment().format('HH:mm:ss');
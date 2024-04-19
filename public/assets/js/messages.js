//! CLIENT_SEND_MESSAGE
let chatSend = document.querySelector('#tynChatSend');
if (chatSend) {
  const chatInput = document.querySelector('#tynChatInput');
  chatInput.addEventListener('keydown', () => {
    showTyping();
  });

  chatSend.addEventListener('click', () => {
    const content = chatInput.value
    if (content.trim() !== ''){
      socket.emit('CLIENT_SEND_MESSAGE', {
        content: content,
        userId: window.user._id
      })
      socket.emit('CLIENT_SEND_TYPING', {
        isTyping: false,
        userId: window.user._id,
        roomChatId: window.roomChatId
      });
    }
  });
}
//! end CLIENT_SEND_MESSAGE

//! SERVER_RETURN_SEND_MESSAGE
socket.on('SERVER_RETURN_SEND_MESSAGE', async (data) => {
  const userId = data.userId;
  const fullName = data.fullName;
  const content = data.content;
  const avatar = data.avatar;
  const createdAt = data.createdAt;

  let chatReply = document.querySelector('#tynReply');
  let chatBody = document.querySelector('#tynChatBody');
  let chatActions = `
    <ul class="tyn-reply-tools">
        <li>
            <button class="btn btn-icon btn-sm btn-transparent btn-pill" >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-emoji-smile-fill" viewBox="0 0 16 16">
                  <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zM7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5zM4.285 9.567a.5.5 0 0 1 .683.183A3.498 3.498 0 0 0 8 11.5a3.498 3.498 0 0 0 3.032-1.75.5.5 0 1 1 .866.5A4.498 4.498 0 0 1 8 12.5a4.498 4.498 0 0 1-3.898-2.25.5.5 0 0 1 .183-.683zM10 8c-.552 0-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5S10.552 8 10 8z"></path>
              </svg>
            </button>
        </li>
        <li class="dropup-center">
            <button class="btn btn-icon btn-sm btn-transparent btn-pill" data-bs-toggle="dropdown">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots" viewBox="0 0 16 16">
                  <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"></path>
              </svg>
            </button>
            <div class="dropdown-menu dropdown-menu-xxs">
                <ul class="tyn-list-links">
                    <li>
                        <a href="#">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"></path>
                                <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"></path>
                            </svg>
                            <span>Delete</span>
                        </a>
                    </li>
                </ul>
            </div>
        </li>
    </ul>
  `;
  if (userId !== window.user._id) {
    let chatBubble = `
    <div class="tyn-reply-bubble">
        <div class="tyn-reply-text w-100">
            <p class="m-0"> ${content} </p>
        </div>
        ${chatActions}
    </div>
    `;
    let incomingWraper = `
    <div class="tyn-reply-item incoming">
      <div class="tyn-reply-avatar">
        <div class="tyn-media tyn-size-md tyn-circle">
          <img src="${avatar}" alt="${fullName}">
        </div>
      </div>
      <div class="tyn-reply-group">
        <div class="tyn-reply-fullName">
          <span class="name fs-6 fw-light">${fullName}</span>
          <!-- <span class="fs-6 fw-light">${new Date(createdAt).toLocaleString('en-GB', {hour: '2-digit', minute: '2-digit', hour12: false })}</span> -->
        </div>
      </div>
    </div>
    `;

    if(!chatReply.querySelector('.tyn-reply-item')?.classList.contains('incoming')){
      chatReply.insertAdjacentHTML("afterbegin", incomingWraper);
      chatReply.querySelector('.tyn-reply-item .tyn-reply-group').insertAdjacentHTML("beforeend", chatBubble);
    }else{
      chatReply.querySelector('.tyn-reply-item .tyn-reply-group').insertAdjacentHTML("beforeend", chatBubble);
    }
  } else {
    let chatBubble = `
    <div class="tyn-reply-bubble">
        <div class="tyn-reply-text w-100">
          <p class="m-0"> ${content} </p>
        </div>
        ${chatActions}
    </div>
    `;
    let outgoingWraper = `
    <div class="tyn-reply-item outgoing">
      <div class="tyn-reply-group">
        <!-- <span class="fs-6 fw-light">${new Date(createdAt).toLocaleString('en-GB', {hour: '2-digit', minute: '2-digit', hour12: false })}</span> -->
      </div>
    </div>
    `;

    if(!chatReply.querySelector('.tyn-reply-item')?.classList.contains('outgoing')){
      chatReply.insertAdjacentHTML("afterbegin", outgoingWraper);
      chatReply.querySelector('.tyn-reply-item .tyn-reply-group').insertAdjacentHTML("beforeend", chatBubble);
    }else{
      chatReply.querySelector('.tyn-reply-item .tyn-reply-group').insertAdjacentHTML("beforeend", chatBubble);
    }
  }
});
//! end SERVER_RETURN_SEND_MESSAGE

//! typing
let timeOut;
const showTyping = () => {
  socket.emit('CLIENT_SEND_TYPING', {
    isTyping: true,
    userId: window.user._id,
    roomChatId: window.roomChatId
  });
  clearTimeout(timeOut);
  timeOut = setTimeout(() => {
    socket.emit('CLIENT_SEND_TYPING', {
      isTyping: false,
      userId: window.user._id,
      roomChatId: window.roomChatId
    });
  }, 3000);
}
//! end typing

//! SERVER_RETURN_TYPING
socket.on('SERVER_RETURN_TYPING', async (data) => {
  const userId = data.userId;
  const fullName = data.fullName;
  const avatar = data.avatar;
  const isTyping = data.isTyping;

  if (userId != window.user._id) {
    let chatReply = document.querySelector('#tynReply');

    if (isTyping) {
      let typingWraper = `
      <div class="tyn-reply-item typing">
        <div class="tyn-reply-avatar">
          <div class="tyn-media tyn-size-md tyn-circle">
            <img src="${avatar}" alt="${fullName}">
          </div>
        </div>
        <div class="tyn-reply-group">
          <div class="tyn-reply-fullName">
            <span class="name fs-6 fw-light">${fullName}</span>
          </div>
        </div>
      </div>
      `;

      let chatBubble = `
        <div class="tyn-reply-bubble">
          <div class="tyn-reply-text">
            <div class="box-typing">
              <div class="inner-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      `;

      if (chatReply.querySelector('.tyn-reply-item')?.classList.contains('typing')) {
        return;
      }
      chatReply.insertAdjacentHTML("afterbegin", typingWraper);
      chatReply.querySelector('.tyn-reply-item .tyn-reply-group').insertAdjacentHTML("beforeend", chatBubble);
    } else {
      if (chatReply.querySelector('.tyn-reply-item')?.classList.contains('typing')) {
        chatReply.querySelector('.tyn-reply-item').remove();
      }
    }
  }
});
//! end SERVER_RETURN_TYPING

//! SERVER_RETURN_TYPING_ASIDE
socket.on('SERVER_RETURN_TYPING_ASIDE', async (data) => {
  const userId = data.userId;
  const isTyping = data.isTyping;
  const roomChatId = data.roomChatId;

  const contactAside = document.querySelector(`[contact-aside][data-room-id="${roomChatId}"]`);
  if (contactAside) {
    if (isTyping) {
      contactAside.querySelector('.typing').classList.remove('d-none');
    } else {
      contactAside.querySelector('.typing').classList.add('d-none');
    }
  }
});
//! end SERVER_RETURN_TYPING_ASIDE
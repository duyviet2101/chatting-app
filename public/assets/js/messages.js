import * as Popper from 'https://cdn.jsdelivr.net/npm/@popperjs/core@^2/dist/esm/index.js'

//! file-upload-with-preview
let upload;
if (document.querySelector('[data-upload-id="upload-image"]')) {
  upload = new FileUploadWithPreview.FileUploadWithPreview('upload-image', {
    showDeleteButtonOnImages: true,
    text: {
      chooseFile: 'Chọn ảnh',
      browse: 'Chọn ảnh',
      selectedCount: `file đã chọn`,
    },
    multiple: true,
    maxFileCount: 6,
  });
}
//! end file-upload-with-preview

//! SERVER_RETURN_STATUS_ONLINE_USER
socket.on('SERVER_RETURN_STATUS_ONLINE_USER', async (data) => {
  const userId = data.userId;
  const statusOnline = data.statusOnline;

  const contactAside = document.querySelector(`[contact-aside][data-user-id="${userId}"]`);
  if (contactAside) {
    const statusOnlineElement = contactAside.querySelector('.statusOnlineAside');
    if (statusOnline == 'online') {
      statusOnlineElement.classList.remove('offline');
      statusOnlineElement.classList.add('online');
    } else {
      statusOnlineElement.classList.remove('online');
      statusOnlineElement.classList.add('offline');
    }
  }

  const statusOnlineChatHead = document.querySelector('.statusOnlineChatHead');
  if (statusOnlineChatHead) {
    if (statusOnline == 'online') {
      statusOnlineChatHead.innerHTML = 'Online';
    } else {
      statusOnlineChatHead.innerHTML = 'Offline';
    }
  }
});
//! end SERVER_RETURN_STATUS_ONLINE_USER

//! CLIENT_SEND_MESSAGE
let chatSend = document.querySelector('#tynChatSend');
if (chatSend) {
  const chatInput = document.querySelector('#tynChatInput');
  chatInput.addEventListener('keydown', () => {
    showTyping();
  });

  chatInput.addEventListener('focusin', () => {
    //* update last message seen
    socket.emit('CLIENT_UPDATE_LAST_MESSAGE_SEEN', {
      userId: window.user._id,
      roomChatId: roomChatId
    });
  })

  chatSend.addEventListener('click', () => {
    const content = chatInput.value
    const images = upload.cachedFileArray || [];

    if (content.trim() !== '' || images.length > 0){
      socket.emit('CLIENT_SEND_MESSAGE', {
        content: content,
        images: images,
        userId: window.user._id
      })
      socket.emit('CLIENT_SEND_TYPING', {
        isTyping: false,
        userId: window.user._id,
        roomChatId: window.roomChatId
      });
      //* update last message seen
      socket.emit('CLIENT_UPDATE_LAST_MESSAGE_SEEN', {
        userId: window.user._id,
        roomChatId: roomChatId
      });

      upload.resetPreviewPanel();
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
  const roomChatId = data.roomChatId;
  const images = data.images;

  let chatReply = document.querySelector('#tynReply');
  let chatBody = document.querySelector('#tynChatBody');
  if (window.roomChatId == roomChatId) { //? update chat body
    if (userId !== window.user._id) {

      let chatBubbleText = '';
      if (content.trim() !== '') {
        chatBubbleText = `
        <div class="tyn-reply-bubble flex-wrap">
            <div class="tyn-reply-text text-break">
                ${content}
            </div>
        </div>
        `;
      };
      let chatBubbleImages = '';
      if (images.length > 0) {
        chatBubbleImages = `
        <div class="tyn-reply-bubble flex-wrap">
          <div class="tyn-reply-media">
            ${images.map(image => `
              <a class="glightbox tyn-thumb" href="${image}" data-gallery='media-photo'>
                <img class="tyn-image" src="${image}" alt="image">
              </a>
            `).join('')}
          </div>
        </div>
        `;
      };
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
        chatReply.querySelector('.tyn-reply-item .tyn-reply-group').insertAdjacentHTML("beforeend", chatBubbleText + chatBubbleImages);
      }else{
        chatReply.querySelector('.tyn-reply-item .tyn-reply-group').insertAdjacentHTML("beforeend", chatBubbleText + chatBubbleImages);
      }
    } else {
      let chatBubbleText = '';
      if (content.trim() !== '') {
        chatBubbleText = `
        <div class="tyn-reply-bubble flex-wrap">
            <div class="tyn-reply-text text-break">
                ${content}
            </div>
        </div>
        `;
      };

      let chatBubbleImages = '';
      if (images.length > 0) {
        chatBubbleImages = `
        <div class="tyn-reply-bubble flex-wrap">
          <div class="tyn-reply-media">
            ${images.map(image => `
              <a class="glightbox tyn-thumb" href="${image}" data-gallery='media-photo'>
                <img class="tyn-image" src="${image}" alt="image">
              </a>
            `).join('')}
          </div>
        </div>
        `;
      };

      let outgoingWraper = `
      <div class="tyn-reply-item outgoing">
        <div class="tyn-reply-group">
          <!-- <span class="fs-6 fw-light">${new Date(createdAt).toLocaleString('en-GB', {hour: '2-digit', minute: '2-digit', hour12: false })}</span> -->
        </div>
      </div>
      `;     

      if(chatReply.querySelector('.tyn-reply-item')?.classList.contains('outgoing')){
        chatReply.querySelector('.tyn-reply-item .tyn-reply-group').insertAdjacentHTML("beforeend", chatBubbleText + chatBubbleImages);
      } else if (chatReply.querySelector('.tyn-reply-item')?.classList.contains('typing')) {
        const typing = chatReply.querySelector('.tyn-reply-item.typing');
        chatReply.insertAdjacentHTML("afterbegin", outgoingWraper);
        chatReply.querySelector('.tyn-reply-item.outgoing .tyn-reply-group').insertAdjacentHTML("beforeend", chatBubbleText + chatBubbleImages);
        chatReply.insertBefore(typing, chatReply.firstChild);
      }
      else{
        chatReply.insertAdjacentHTML("afterbegin", outgoingWraper);
        chatReply.querySelector('.tyn-reply-item .tyn-reply-group').insertAdjacentHTML("beforeend", chatBubbleText + chatBubbleImages);
      }
    }
    const lightbox = GLightbox({
      touchNavigation: true,
      loop: true,
      autoplayVideos: true
    });
  }
  
  //? update aside list contact
  const contactAside = document.querySelector(`[contact-aside][data-room-id="${roomChatId}"]`);
  if (contactAside) {
    const lastMessage = contactAside.querySelector('[lastMessage]');
    const lastTime = contactAside.querySelector('[lastTime]');
    const seen = contactAside.querySelector('[seen]');
    if (userId.toString() != window.user._id.toString()) {
      lastMessage.innerHTML = content ? content : '📷 Image';
      contactAside.classList.add('unread');
      seen.classList.add('d-none');
    } else {
      console.log(userId != window.user._id)
      lastMessage.innerHTML = 'You: ' + (content ? content : '📷 Image');
      contactAside.classList.remove('unread');
      seen.classList.add('d-none');
    }
    lastTime.innerHTML = moment(createdAt).fromNow();
    lastTime.setAttribute('data-time', createdAt);

    contactAside.classList.remove('d-none');
    const asideList = document.querySelector('.tyn-aside-list');
    asideList.insertBefore(contactAside, asideList.firstChild);
  }

  const countMessages = document.querySelector('[notifications-messages] .count-messages');
  countMessages.innerHTML = document.querySelectorAll('[contact-aside].unread').length;
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
  const roomChatId = data.roomChatId;

  if (userId != window.user._id && roomChatId == window.roomChatId) {
    let chatReply = document.querySelector('#tynReply');

    if (isTyping) { //? show typing
      let typingWraper = `
      <div class="tyn-reply-item typing" data-user-id=${userId}>
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
    } else //? hide typing 
    {
      const typings = chatReply.querySelectorAll('.tyn-reply-item.typing');
      typings.forEach(typing => {
        if (typing.dataset.userId == userId) {
          typing.remove();
        }
      });
    }

  }
  const contactAside = document.querySelector(`[contact-aside][data-room-id="${roomChatId}"]`);
  if (contactAside && userId != window.user._id) {
    if (isTyping) {
      contactAside.querySelector('.typing').classList.remove('d-none');
    } else {
      contactAside.querySelector('.typing').classList.add('d-none');
    }
  }
});
//! end SERVER_RETURN_TYPING

//! SERVER_RETURN_LAST_MESSAGE_SEEN
socket.on('SERVER_RETURN_LAST_MESSAGE_SEEN', async (data) => {
  const userId = data.userId;
  const roomChatId = data.roomChatId;
  const fullName = data.fullName;

  if (userId == window.user._id) {
    const contactAside = document.querySelector(`[contact-aside][data-room-id="${roomChatId}"]`);
    if (contactAside)
      contactAside.classList.remove('unread');
    const countMessages = document.querySelector('[notifications-messages] .count-messages');
    countMessages.innerHTML = document.querySelectorAll('[contact-aside].unread').length;
  } else {
    if (roomChatId == window.roomChatId) {
      let chatReply = document.querySelector('#tynReply');
  
      chatReply.querySelectorAll('.seen').forEach(seen => {
        seen.remove();
      });
  
      const lastMessage = chatReply.querySelector('.tyn-reply-item');
  
      if (lastMessage && lastMessage.classList.contains('outgoing')) {
        lastMessage.querySelector('.tyn-reply-group').insertAdjacentHTML("beforeend", `
        <div class="seen col-12 text-end">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check2-circle" viewBox="0 0 16 16">
            <path d="M2.5 8a5.5 5.5 0 0 1 8.25-4.764.5.5 0 0 0 .5-.866A6.5 6.5 0 1 0 14.5 8a.5.5 0 0 0-1 0 5.5 5.5 0 1 1-11 0" />
            <path d="M15.354 3.354a.5.5 0 0 0-.708-.708L8 9.293 5.354 6.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0z" />
          </svg>
          ${fullName}
        </div>
        `);
      }

    }
    const contactAside = document.querySelector(`[contact-aside][data-room-id="${roomChatId}"]`);
    if (contactAside && !contactAside.classList.contains('unread')) {
      contactAside.querySelector('[seen]').classList.remove('d-none');
    }
  }
});
//! end SERVER_RETURN_LAST_MESSAGE_SEEN

//! delete messages
const deleteMessagesBtns = document.querySelectorAll('[delete-messages]');
if (deleteMessagesBtns && deleteMessagesBtns.length > 0) {
  deleteMessagesBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const roomChatId = btn.getAttribute('data-room-id-delete-messages');

      const formDeleteChat = document.querySelector('#deleteChat');
      formDeleteChat.addEventListener('submit', async (e) => {
        e.preventDefault();
        formDeleteChat.action = `/messages/${roomChatId}/delete?_method=DELETE`;
        formDeleteChat.submit();
      });
    })
  })
}
//! end delete messages

//! interval update last message seen
const intervalUpdateLastMessageSeenTime = setInterval(() => {
  const lastTime = document.querySelectorAll('[lastTime]');
  if (lastTime && lastTime.length > 0) {
    lastTime.forEach(time => {
      const timeValue = time.getAttribute('data-time');
      if (timeValue)
        time.innerHTML = moment(timeValue).fromNow();
    });
  }
}, 1000 * 60);
//! end interval update last message seen

//! emoji picker
//? show emoji picker
const buttonIcon = document.querySelector('.button-emoji-picker');
if (buttonIcon) {
  const tooltip = document.querySelector('.tooltip');
  Popper.createPopper(buttonIcon, tooltip);

  const emojiContainer = document.querySelector('.emoji-container');

  buttonIcon.onclick = () => {
    emojiContainer.classList.toggle('shown');
    tooltip.classList.toggle('shown');
  }

  if (emojiContainer) {
    emojiContainer.onclick = () => {
      tooltip.classList.remove('shown');
      emojiContainer.classList.remove('shown');
    }
  }
} 

//? insert icon to input
if (document.querySelector('#tynChatInput')) {
  const emojiPicker = document.querySelector("emoji-picker");
  if (emojiPicker) {
    const inputChat = document.querySelector('#tynChatInput');

    emojiPicker.addEventListener("emoji-click", (event) => {
      const icon = event.detail.unicode;
      inputChat.value += icon;
      inputChat.setSelectionRange(inputChat.value.length, inputChat.value.length)
      inputChat.focus();
      showTyping()
    });

    inputChat.addEventListener('keyup', (e) => {
      if (e.key != 'Enter')
        showTyping()
    })
  }
}
//! end emoji picker

//! search contactList
const searchContactList = document.querySelector('#search-contact-list');
if (searchContactList) {
  const input = searchContactList.querySelector('#input-search');
  const list = searchContactList.querySelector('.tyn-media-list');

  let timeout;
  input.addEventListener('input', () => {
    list.innerHTML = `
      <li>
        <div class="tyn-media-group">
            <div class="tyn-media-col">
            <div class="tyn-media-row">
              <h6 class="name">Searching...</h6>
            </div>
            </div>
        </div>
      </li>
    `;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      const value = input.value.trim();
      if (value) {
        fetch(`/contacts/contactList/search?keyword=${value}`)
          .then(response => response.json())
          .then(data => {
            const contacts = data.result;
            list.innerHTML = '';
            contacts.forEach(contact => {
              list.insertAdjacentHTML('beforeend', `
                <li>
                  <a class="tyn-media-group" href="/messages/${contact.room_chat_id}">
                    <div class="tyn-media">
                      <img src="${contact.user.avatar}" alt="">
                    </div>
                    <div class="tyn-media-col">
                      <div class="tyn-media-row">
                        <h6 class="name">${contact.user.fullName}</h6>
                      </div>
                      <div class="tyn-media-row">
                        <p class="content">@${contact.user.username}</p>
                      </div>
                    </div>
                  </a>
                </li>
              `);
            })

            if (contacts.length === 0) {
              list.innerHTML = `
                <li>
                  <div class="tyn-media-group">
                      <div class="tyn-media-col">
                      <div class="tyn-media-row">
                        <h6 class="name">No results found</h6>
                      </div>
                      </div>
                  </div>
                </li>
              `;
            }
          })
          .catch(error => console.error(error));
      } else {
        list.innerHTML = `
          <li>
            <div class="tyn-media-group">
                <div class="tyn-media-col">
                <div class="tyn-media-row">
                  <h6 class="name">Type a name to search</h6>
                </div>
                </div>
            </div>
          </li>
        `;
      }
    }, 500);
  });
}
//! end search contactList

//! send request
const addEventSendRequest = (btn) => {
  const username = btn.getAttribute('data-username');

  btn.addEventListener('click', () => {
    socket.emit('CLIENT_SEND_REQUEST_CONTACT', username);

    const btns = document.querySelectorAll('[send-request][data-username="' + username + '"]');
    btns.forEach(btn => {
      btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check" viewBox="0 0 16 16">
            <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z" />
        </svg>
      `;
      btn.disabled = true;
    });
  });
};
const sendRequestBtn = document.querySelectorAll('[send-request]');
if (sendRequestBtn && sendRequestBtn.length > 0) {
  sendRequestBtn.forEach(btn => {
    addEventSendRequest(btn);
  });
}
//! end send request

//! SERVER_RETURN_LENGTH_REQUESTS_RECEIVED
socket.on('SERVER_RETURN_LENGTH_REQUESTS_RECEIVED', data => {
  const {
    userId,
    lengthContactRequestsReceived
  } = data;
  if (userId == window.user._id) {
    const countRequestNoti = document.querySelector('.count-request');

    if (countRequestNoti) {
      countRequestNoti.innerHTML = lengthContactRequestsReceived;
      createAlertNotice('Your have a new contact request!')
    }

    const countRequestPane = document.querySelector('.count-request-pane');
    if (countRequestPane) {
      if (lengthContactRequestsReceived == 0)
        countRequestPane.innerHTML = '';
      else
        countRequestPane.innerHTML = `(${lengthContactRequestsReceived})`;
    }
  }
});
//! end SERVER_RETURN_LENGTH_REQUESTS_RECEIVED

//! SERVER_RETURN_INFO_REQUEST_RECEIVED
socket.on('SERVER_RETURN_INFO_REQUEST_RECEIVED', data => {
  const {
    userId,
    infoUserA
  } = data;
  if (userId == window.user._id) {
    const requestListNoti = document.querySelector('.request-list');
    if (requestListNoti) {
      requestListNoti.querySelector('.no-noti')?.remove();
      const firstLi = requestListNoti.querySelector('li');

      const li = document.createElement('li');
      li.setAttribute('data-username', infoUserA.username);
      li.innerHTML = `
        <div class="tyn-media-group align-items-start">
            <div class="tyn-media tyn-circle">
                <img src="${infoUserA.avatar}" alt="${infoUserA.fullName}">
            </div>
            <div class="tyn-media-col">
                <div class="tyn-media-row">
                    <span class="message"><strong>${infoUserA.fullName}</strong> Added You</span>
                </div>
                <div class="tyn-media-row">
                    <ul class="tyn-btn-inline gap gap-3 pt-1">
                        <li>
                            <button class="btn btn-md btn-primary" accept-request data-username="${infoUserA.username}">
                                <!-- check2-circle -->
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check2-circle" viewBox="0 0 16 16">
                                    <path d="M2.5 8a5.5 5.5 0 0 1 8.25-4.764.5.5 0 0 0 .5-.866A6.5 6.5 0 1 0 14.5 8a.5.5 0 0 0-1 0 5.5 5.5 0 1 1-11 0" />
                                    <path d="M15.354 3.354a.5.5 0 0 0-.708-.708L8 9.293 5.354 6.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0z" />
                                </svg>
                                <span>Accept</span>
                            </button>
                        </li>
                        <li>
                            <button class="btn btn-md btn-light" reject-request data-username="${infoUserA.username}">
                                <!-- x-circle -->
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16">
                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                                </svg>
                                <span>Reject</span>
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
      `;
      if (firstLi)
        requestListNoti.insertBefore(li, firstLi);
      else
        requestListNoti.appendChild(li);

      const acceptRequestBtn = li.querySelector('[accept-request]');
      if (acceptRequestBtn) {
        addEventAcceptRequest(acceptRequestBtn);
      }

      const rejectRequestBtn = li.querySelector('[reject-request]');
      if (rejectRequestBtn) {
        addEventRejectRequest(rejectRequestBtn);
      }
    }

    const requestListPane = document.querySelector('#contact-request-received.tab-pane ul');
    if (requestListPane) {
      const firstLi = requestListPane.querySelector('li');

      const li = document.createElement('li');
      li.classList.add('tyn-aside-item', 'js-toggle-main');
      li.setAttribute('data-username', infoUserA.username);
      li.innerHTML = `
        <div class="tyn-media-group">
          <div class="tyn-media tyn-size-lg">
            <img src="${ infoUserA.avatar }" alt="">
          </div>
          <div class="tyn-media-col" onclick="window.location.href='/contacts/profile/${ infoUserA.username }#contact-request-received'">
            <div class="tyn-media-row">
              <h6 class="name">${ infoUserA.fullName }</h6>
            </div>
            <div class="tyn-media-row">
              <p class="content">@${ infoUserA.username }</p>
            </div>
          </div>
          <div class="tyn-media-option tyn-aside-item-option">
            <ul class="tyn-media-option-list">
              <li>
                <button class="btn btn-icon btn-white btn-pill me-1" accept-request data-username="${ infoUserA.username }">
                  <!-- check2-circle -->
                  <svg class="bi bi-check2-circle" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M2.5 8a5.5 5.5 0 0 1 8.25-4.764.5.5 0 0 0 .5-.866A6.5 6.5 0 1 0 14.5 8a.5.5 0 0 0-1 0 5.5 5.5 0 1 1-11 0"/>
                    <path d="M15.354 3.354a.5.5 0 0 0-.708-.708L8 9.293 5.354 6.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0z"/>
                  </svg>
                </button>
                <button class="btn btn-icon btn-white btn-pill" reject-request data-username="${ infoUserA.username }">
                  <!-- x-lg -->
                  <svg class="bi bi-x-lg" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                  </svg>
                </button>
              </li>
            </ul>
          </div>
        </div>
      `;
      if (firstLi)
        requestListPane.insertBefore(li, firstLi);
      else
        requestListPane.appendChild(li);

      const acceptRequestBtn = li.querySelector('[accept-request]');
      if (acceptRequestBtn) {
        addEventAcceptRequest(acceptRequestBtn);
      }

      const rejectRequestBtn = li.querySelector('[reject-request]');
      if (rejectRequestBtn) {
        addEventRejectRequest(rejectRequestBtn);
      }
    }
  };
});
//! end SERVER_RETURN_INFO_REQUEST_RECEIVED

//! cancel request
const addEventCancelRequest = (btn) => {
  const username = btn.getAttribute('data-username');

  btn.addEventListener('click', () => {
    socket.emit('CLIENT_CANCEL_REQUEST_CONTACT', username);

    const btns = document.querySelectorAll('[cancel-request][data-username="' + username + '"]');
    btns.forEach(btn => {
      btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check" viewBox="0 0 16 16">
          <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z" />
        </svg>
      `;
      btn.disabled = true;
    });
  });
};
const cancelRequestBtn = document.querySelectorAll('[cancel-request]');
if (cancelRequestBtn && cancelRequestBtn.length > 0) {
  cancelRequestBtn.forEach(btn => {
    addEventCancelRequest(btn);
  });
};
//! end cancel request

//! SERVER_RETURN_LENGTH_REQUESTS_RECEIVED_CANCEL
socket.on('SERVER_RETURN_LENGTH_REQUESTS_RECEIVED_CANCEL', data => {
  const {
    userId,
    lengthContactRequestsReceived
  } = data;
  if (userId == window.user._id) {
    const countRequestNoti = document.querySelector('.count-request');

    if (countRequestNoti) {
      countRequestNoti.innerHTML = lengthContactRequestsReceived;
    }

    const countRequestPane = document.querySelector('.count-request-pane');
    if (countRequestPane) {
      if (lengthContactRequestsReceived == 0)
        countRequestPane.innerHTML = '';
      else
        countRequestPane.innerHTML = `(${lengthContactRequestsReceived})`;
    }
  }
});
//! end SERVER_RETURN_LENGTH_REQUESTS_RECEIVED_CANCEL

//! SERVER_RETURN_INFO_CANCEL_REQUEST
socket.on('SERVER_RETURN_INFO_CANCEL_REQUEST', data => {
  const {
    userId,
    username
  } = data;
  if (userId == window.user._id) {
    const requestListNoti = document.querySelector('.request-list');
    if (requestListNoti) {
      const li = requestListNoti.querySelector(`li[data-username="${username}"]`);
      if (li)
        li.remove();
    }

    const requestListPane = document.querySelector('#contact-request-received.tab-pane ul');
    if (requestListPane) {
      const li = requestListPane.querySelector(`li[data-username="${username}"]`);
      if (li)
        li.remove();
    }

    const requestSentList = document.querySelector('#contact-request-sent.tab-pane ul');
    if (requestSentList) {
      const li = requestSentList.querySelector(`li[data-username="${username}"]`);
      if (li)
        li.remove();
    }
  }
});
//! end SERVER_RETURN_INFO_CANCEL_REQUEST

//! SERVER_RETURN_LENGTH_REQUESTS_SENT
socket.on('SERVER_RETURN_LENGTH_REQUESTS_SENT', data => {
  const {
    userId,
    lengthContactRequestsSent
  } = data;
  if (userId == window.user._id) {
    const countRequestPane = document.querySelector('.count-request-sent-pane');
    if (countRequestPane) {
      if (lengthContactRequestsSent == 0)
        countRequestPane.innerHTML = '';
      else
        countRequestPane.innerHTML = `(${lengthContactRequestsSent})`;
    }
  }
});
//! end SERVER_RETURN_LENGTH_REQUESTS_SENT

//! SERVER_RETURN_INFO_REQUEST_SENT
socket.on('SERVER_RETURN_INFO_REQUEST_SENT', data => {
  const {
    userId,
    infoUserB
  } = data;
  if (userId == window.user._id) {
    const requestListPane = document.querySelector('#contact-request-sent.tab-pane ul');
    if (requestListPane) {
      const firstLi = requestListPane.querySelector('li');

      const li = document.createElement('li');
      li.classList.add('tyn-aside-item', 'js-toggle-main');
      li.setAttribute('data-username', infoUserB.username);
      li.innerHTML = `
        <div class="tyn-media-group">
          <div class="tyn-media tyn-size-lg">
            <img src="${ infoUserB.avatar }" alt="">
          </div>
          <div class="tyn-media-col" onclick="window.location.href='/contacts/profile/${ infoUserB.username }#contact-request-sent'">
            <div class="tyn-media-row">
              <h6 class="name">${ infoUserB.fullName }</h6>
            </div>
            <div class="tyn-media-row">
              <p class="content">@${ infoUserB.username }</p>
            </div>
          </div>
          <div class="tyn-media-option tyn-aside-item-option">
            <ul class="tyn-media-option-list">
              <li>
                <button class="btn btn-icon btn-white btn-pill" cancel-request data-username="${ infoUserB.username }">
                  <!-- x-lg -->
                  <svg class="bi bi-x-lg" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d='M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z' />
                  </svg>
                </button>
              </li>
            </ul>
          </div>
        </div>
      `;
      if (firstLi)
        requestListPane.insertBefore(li, firstLi);
      else
        requestListPane.appendChild(li);

      const cancelRequestBtn = li.querySelector('[cancel-request]');
      if (cancelRequestBtn) {
        addEventCancelRequest(cancelRequestBtn);
      }
    }
  };

});
//! end SERVER_RETURN_INFO_REQUEST_SENT

//! accept request
const addEventAcceptRequest = (btn) => {
  const username = btn.getAttribute('data-username');
  btn.addEventListener('click', () => {
    socket.emit('CLIENT_ACCEPT_REQUEST_CONTACT', username);
    // btn.closest('.tyn-aside-item').remove();
  });
};
const acceptRequestBtn = document.querySelectorAll('[accept-request]');
if (acceptRequestBtn && acceptRequestBtn.length > 0) {
  acceptRequestBtn.forEach(btn => {
    addEventAcceptRequest(btn);
  });
}
//! end accept request

//! SERVER_RETURN_INFO_ACCEPT_REQUEST
socket.on('SERVER_RETURN_INFO_ACCEPT_REQUEST', data => {
  const {
    userId,
    infoUser
  } = data;

  if (userId == window.user._id) {
    const requestSentList = document.querySelector('#contact-request-sent.tab-pane ul');
    if (requestSentList) {
      const li = requestSentList.querySelector(`li[data-username="${infoUser.username}"]`);
      if (li)
        li.remove();
    }

    const contactList = document.querySelector('#contact-all.tab-pane ul.contact-list');
    if (contactList) {
      const firstLi = contactList.querySelector('li');
      contactList.querySelector('.no-contacts')?.remove();

      const li = document.createElement('li');
      li.classList.add('tyn-aside-item', 'js-toggle-main');
      li.setAttribute('data-username', infoUser.username);
      li.innerHTML = `
        <div class="tyn-media-group">
          <div class="tyn-media tyn-size-lg">
            <img src="${ infoUser.avatar }" alt="">
          </div>
          <div class="tyn-media-col" onclick="window.location.href='/contacts/profile/${ infoUser.username }#contact-all'">
            <div class="tyn-media-row">
              <h6 class="name">${ infoUser.fullName }</h6>
            </div>
            <div class="tyn-media-row">
              <p class="content">@${ infoUser.username }</p>
            </div>
          </div>
          <div class="tyn-media-option tyn-aside-item-option">
            <ul class="tyn-media-option-list">
              <li class="dropdown">
                <div class="btn btn-icon btn-white btn-pill dropdown-toggle" data-bs-toggle="dropdown" data-bs-offset="0,0">
                  <!-- three-dots -->
                  <svg class="bi bi-three-dots" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"></path>
                  </svg>
                </div>
                <div class="dropdown-menu dropdown-menu-end">
                  <ul class="tyn-list-links">
                    <li>
                      <a href="/contacts/profile/${ infoUser.username }">
                        <!-- person -->
                        <svg class="bi bi-person" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"></path>
                        </svg>
                        <span>View Profile</span>
                      </a>
                    </li>
                    <li class="dropdown-divider"></li>
                    <li>
                      <a href="/messages/${ infoUser.room_chat_id }">
                        <!-- chat -->
                        <svg class="bi bi-chat" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M2.678 11.894a1 1 0 0 1 .287.801 11 11 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8 8 0 0 0 8 14c3.996 0 7-2.807 7-6s-3.004-6-7-6-7 2.808-7 6c0 1.468.617 2.83 1.678 3.894m-.493 3.905a22 22 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a10 10 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105"></path>
                        </svg>
                        <span>Send Message</span>
                      </a>
                    </li>
                    <li class="dropdown-divider"></li>
                    <li>
                      <a href="#" remove-contact data-username=${infoUser.username}>
                        <!-- person-x -->
                        <svg class="bi bi-person-x" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0M8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m.256 7a4.5 4.5 0 0 1-.229-1.004H3c.001-.246.154-.986.832-1.664C4.484 10.68 5.711 10 8 10q.39 0 .74.025c.226-.341.496-.65.804-.918Q8.844 9.002 8 9c-5 0-6 3-6 4s1 1 1 1z"></path>
                          <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m-.646-4.854l.646.647.646-.647a.5.5 0 0 1 .708.708l-.647.646.647.646a.5.5 0 0 1-.708.708l-.646-.647-.646.647a.5.5 0 0 1-.708-.708"></path>
                        </svg>
                        <span>Remove Contact</span>
                      </a>
                    </li>
                  </ul>
                </div>
              </li>
            </ul>
          </div>
        </div>
      `;
      if (firstLi)
        contactList.insertBefore(li, firstLi);
      else
        contactList.appendChild(li);

      const removeContactBtn = li.querySelector('[remove-contact]');
      if (removeContactBtn) {
        addEventRemoveContact(removeContactBtn);
      }
    }

    const infoUserMain = document.querySelector(`.tyn-profile-info[data-info-user-id="${infoUser._id}"]`);
    if (infoUserMain) {
      const action = infoUserMain.querySelector('.tyn-media-multiple.action');
      action.innerHTML = `
        <a class="btn btn-primary" href="/messages/${infoUser.room_chat_id}">
        <!-- envelope-fill--><svg class="bi bi-chat-text-fill" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
          fill="currentColor" viewBox="0 0 16 16">
          <path
            d="M16 8c0 3.866-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7M4.5 5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1zm0 2.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1zm0 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1z">
          </path>
        </svg><span>Message</span></a>
      `;
    }

    //! insert contact to aside list /messages
    const asideMessagesList = document.querySelector('.tyn-aside-list.messages-aside-list');
    if (asideMessagesList) {
      const contactAside = document.querySelector(`[contact-aside][data-room-id="${roomChatId}"]`);
      if (contactAside) {
        return;
      }
      const html = `
        <li class="tyn-aside-item js-toggle-main d-none" contact-aside data-room-id="${infoUser.room_chat_id}"
          data-user-id="${infoUser._id}">
          <div class="tyn-media-group"><a class="tyn-media tyn-size-lg" href="/messages/${infoUser.room_chat_id}"><img
                src="${infoUser.avatar}" alt=""></a><a class="tyn-media-col"
              href="/messages/${infoUser.room_chat_id}">
              <div class="tyn-media-row">
                <h6 class="name">${infoUser.fullName}</h6><span class="typing d-none">typing ...</span>
                <div class="indicator statusOnlineAside ${infoUser.statusOnline == 'online' ? 'online' : 'offline'}">
                  <!-- check-circle-fill--><svg class="bi bi-circle-fill" xmlns="http://www.w3.org/2000/svg" width="16"
                    height="16" fill="currentColor" viewBox="0 0 16 16">
                    <circle cx="8" cy="8" r="8"></circle>
                  </svg></div>
              </div>
              <div class="tyn-media-row has-dot-sap">
                <p class="content" lastmessage="">No messages</p>
                <span class="meta" lasttime="" data-time="">N/A</span
                ><span class="meta d-none" seen="">Seen </span>
              </div>
            </a>
            <div class="tyn-media-option tyn-aside-item-option">
              <ul class="tyn-media-option-list">
                <li class="dropdown">
                  <div class="btn btn-icon btn-white btn-pill dropdown-toggle" data-bs-toggle="dropdown" data-bs-offset="0,0"
                    data-bs-auto-close="outside">
                    <!-- three-dots--><svg class="bi bi-three-dots" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                      fill="currentColor" viewBox="0 0 16 16">
                      <path
                        d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3">
                      </path>
                    </svg></div>
                  <div class="dropdown-menu dropdown-menu-end">
                    <ul class="tyn-list-links">
                      <li><a href="/contacts/profile/${infoUser.username}">
                          <!-- person--><svg class="bi bi-person" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                            fill="currentColor" viewBox="0 0 16 16">
                            <path
                              d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z">
                            </path>
                          </svg><span>View Profile</span></a></li>
                      <li class="dropdown-divider"></li>
                      <li><a href="#deleteChat" data-bs-toggle="modal" delete-messages=""
                          data-room-id-delete-messages="${infoUser.room_chat_id}">
                          <!-- trash--><svg class="bi bi-trash" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                            fill="currentColor" viewBox="0 0 16 16">
                            <path
                              d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z">
                            </path>
                            <path
                              d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z">
                            </path>
                          </svg><span>Delete</span></a></li>
                    </ul>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </li>
      `;
      asideMessagesList.insertAdjacentHTML('beforeend', html);
    }
    //! end insert contact to aside list /messages

    socket.emit('JOIN', infoUser.room_chat_id);
  }
});
//! end SERVER_RETURN_INFO_ACCEPT_REQUEST

//! SERVER_RETURN_LENGTH_CONTACT_LIST
socket.on('SERVER_RETURN_LENGTH_CONTACT_LIST', data => {
  const {
    userId,
    lengthContactList
  } = data;
  if (userId == window.user._id) {
    const countContactAside = document.querySelector('.count-contact-aside');
    if (countContactAside) {
      countContactAside.innerHTML = `${lengthContactList} `;
    }
  }
});
//! end SERVER_RETURN_LENGTH_CONTACT_LIST

//! remove contact
const addEventRemoveContact = (btn) => {
  const username = btn.getAttribute('data-username');

  btn.addEventListener('click', () => {
    socket.emit('CLIENT_REMOVE_CONTACT', username);
    btn.closest('.tyn-aside-item').remove();
  });
};
const removeContactBtn = document.querySelectorAll('[remove-contact]');
if (removeContactBtn && removeContactBtn.length > 0) {
  removeContactBtn.forEach(btn => {
    addEventRemoveContact(btn);
  });
}
//! end remove contact

//! SERVER_RETURN_REMOVE_CONTACT
socket.on('SERVER_RETURN_REMOVE_CONTACT', data => {
  const {
    userId,
    username
  } = data;
  if (userId == window.user._id) {
    const contactList = document.querySelector('#contact-all.tab-pane ul.contact-list');
    if (contactList) {
      const li = contactList.querySelector(`li[data-username="${username}"]`);
      if (li)
        li.remove();
    }
  }
});
//! end SERVER_RETURN_REMOVE_CONTACT

//! reject request
const addEventRejectRequest = (btn) => {
  const username = btn.getAttribute('data-username');

  btn.addEventListener('click', () => {
    socket.emit('CLIENT_REJECT_REQUEST_CONTACT', username);
  });
};
const rejectRequestBtn = document.querySelectorAll('[reject-request]');
if (rejectRequestBtn && rejectRequestBtn.length > 0) {
  rejectRequestBtn.forEach(btn => {
    addEventRejectRequest(btn);
  });
}
//! end reject request


//! search user
const searchUser = document.querySelector('#search-user');
if (searchUser) {
  const input = searchUser.querySelector('#input-search');
  const list = searchUser.querySelector('.tyn-media-list');

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
        fetch(`/contacts/search?keyword=${value}`)
          .then(response => response.json())
          .then(data => {
            const users = data.result;
            list.innerHTML = '';
            users.forEach(user => {
              list.insertAdjacentHTML('beforeend', `
            <li>
              <a class="tyn-media-group" href="/contacts/profile/${user.username}">
                <div class="tyn-media">
                  <img src="${user.avatar}" alt="">
                </div>
                <div class="tyn-media-col">
                  <div class="tyn-media-row">
                    <h6 class="name">${user.fullName}</h6>
                  </div>
                  <div class="tyn-media-row">
                    <p class="content">@${user.username}</p>
                  </div>
                </div>
              </a>
            </li>
          `);
            });

            if (users.length == 0) {
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
          .catch(err => {
            console.log(err);
          });
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
};
//! end search user
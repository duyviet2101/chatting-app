//! send request
const addEventSendRequest = (btn) => {
  const username = btn.getAttribute('data-username');

  btn.addEventListener('click', () => {
    socket.emit('CLIENT_SEND_REQUEST_CONTACT', username);
    btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check" viewBox="0 0 16 16">
          <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z" />
      </svg>
    `;
    btn.disabled = true;
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
                            <button class="btn btn-md btn-primary" accept-request data-username="${infoUserA.fullName}">
                                <!-- check2-circle -->
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check2-circle" viewBox="0 0 16 16">
                                    <path d="M2.5 8a5.5 5.5 0 0 1 8.25-4.764.5.5 0 0 0 .5-.866A6.5 6.5 0 1 0 14.5 8a.5.5 0 0 0-1 0 5.5 5.5 0 1 1-11 0" />
                                    <path d="M15.354 3.354a.5.5 0 0 0-.708-.708L8 9.293 5.354 6.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0z" />
                                </svg>
                                <span>Accept</span>
                            </button>
                        </li>
                        <li>
                            <button class="btn btn-md btn-light" reject-request data-username="${infoUserA.fullName}">
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
    }
  };
});
//! end SERVER_RETURN_INFO_REQUEST_RECEIVED

//! cancel request
const addEventCancelRequest = (btn) => {
  const username = btn.getAttribute('data-username');

  btn.addEventListener('click', () => {
    socket.emit('CLIENT_CANCEL_REQUEST_CONTACT', username);
    btn.closest('.tyn-aside-item').remove();
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
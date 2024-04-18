//! send request
const sendRequestBtn = document.querySelectorAll('[send-request]');
if (sendRequestBtn && sendRequestBtn.length > 0) {
  sendRequestBtn.forEach(btn => {
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
    const countRequest = document.querySelector('.count-request');

    if (countRequest) {
      countRequest.innerHTML = lengthContactRequestsReceived;
      createAlertNotice('Your have a new contact request!')
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
    const requestList = document.querySelector('.request-list');
    if (requestList) {
      requestList.querySelector('.no-noti')?.remove();
      const firstLi = requestList.querySelector('li');

      const li = document.createElement('li');
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
        requestList.insertBefore(li, firstLi);
      else
        requestList.appendChild(li);
    }
  };
});
//! end SERVER_RETURN_INFO_REQUEST_RECEIVED
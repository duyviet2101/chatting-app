//! send request
const sendRequestBtn = document.querySelectorAll('[send-request]');
if (sendRequestBtn && sendRequestBtn.length > 0) {
  sendRequestBtn.forEach(btn => {
    const username = btn.getAttribute('data-username');

    btn.addEventListener('click', () => {
      socket.emit('CLIENT_SEND_REQUEST_CONTACT', username);
    });
  });
}
//! end send request
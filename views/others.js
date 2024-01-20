
input.addEventListener('focus', () => {
  voice.style.display = 'none';
});
input.addEventListener('blur', () => {
  voice.style.display = 'flex';
});
const chatMessages = document.querySelector('.chat-messages');
const scrollToBottomButton = document.getElementById('scroll-to-bottom');
function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
function toggleScrollToBottomButton() {
  if (chatMessages.scrollHeight - chatMessages.scrollTop === chatMessages.clientHeight) {
    scrollToBottomButton.classList.remove('show');
  } else {
    scrollToBottomButton.classList.add('show');
  }
}


scrollToBottomButton.addEventListener('click', scrollToBottom);

chatMessages.addEventListener('scroll', toggleScrollToBottomButton);

toggleScrollToBottomButton();

const keyboardsBtn = document.querySelector('#keys');
const videoCutBtn = document.querySelector('#videoCut');
function handleClicks() {
  
  const chatContainer = document.querySelector('.chat-container');

  chatContainer.style.display = "flex";
  document.querySelector('.video-container').style.display = "none";
   
}

keyboardsBtn.addEventListener('click', handleClicks);
videoCutBtn.addEventListener('click', handleClicks);

const threeDots = document.getElementById("threeDots");
const menuContainer = document.querySelector(".menu-container");
const closeButton = document.querySelector(".close-button");
const shareButton = document.querySelector(".share-button");
const captureButton = document.querySelector(".capture-button");


threeDots.addEventListener("click", () => {
  menuContainer.style.display = "flex";
});

closeButton.addEventListener("click", () => {
  menuContainer.style.display = "none";
});

shareButton.addEventListener("click", async () => {
  menuContainer.style.display = "none";

  try {
    await navigator.share({
      url: window.location.href,
      title: `Checkout this amazing app I found. Have a fun chit-chat with Emma.`,
    });
  } catch (error) {
    console.error('Error sharing:', error);
  }
});

   
      
document.addEventListener("click", (event) => {
  if (!menuContainer.contains(event.target) && !threeDots.contains(event.target)) {
    menuContainer.style.display = "none";
  }
});

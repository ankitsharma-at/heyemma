
const susform = document.getElementById('sus-form');
const susinput = document.getElementById('sus-input');
susform.addEventListener('submit', e => {
  e.preventDefault();
  
  socket.emit('send sus', susinput.value);
  susinput.value = 'Thanks :)';
});
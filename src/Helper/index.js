const isLoggedIn = (history, { uid }) => {
  if (!uid) {
    history.push('/');
    return;
  }

  if (history.location.pathname === '/') {
    history.push('/home');
  }
};

export default isLoggedIn;

const isLoggedIn = history => {
  if (!localStorage.getItem('uid')) {
    history.push('/');
    return;
  }

  if (history.location.pathname === '/home') {
    return;
  }

  history.push('/home');
};

export default isLoggedIn;

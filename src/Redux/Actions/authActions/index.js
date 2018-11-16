const updateUser = user => ({
  type: 'UPDATE_USER',
  user,
});

const removeUser = () => ({
  type: 'REMOVE_USER',
});

const clearState = () => ({
  type: 'CLEAR_STATE',
});

export { updateUser, removeUser, clearState };

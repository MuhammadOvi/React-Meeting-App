const updateUserStatus = status => ({
  status,
  type: 'UPDATE_USER_STATUS',
});

const removeUserStatus = () => ({
  type: 'REMOVE_USER_STATUS',
});

export { updateUserStatus, removeUserStatus };

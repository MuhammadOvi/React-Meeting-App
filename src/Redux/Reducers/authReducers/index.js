const initialState = {
  user: {},
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'UPDATE_USER': {
      return { ...state, user: action.user };
    }
    case 'REMOVE_USER': {
      return { ...state, user: {} };
    }
    case 'CLEAR_STATE': {
      return { user: {} };
    }
    default: {
      return state;
    }
  }
};

export default authReducer;

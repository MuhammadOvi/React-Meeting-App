const initialState = {
  status: '',
};

const homeReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'UPDATE_USER_STATUS': {
      return { ...state, status: action.status };
    }
    case 'REMOVE_USER_STATUS': {
      return { ...state, status: '' };
    }
    default: {
      return state;
    }
  }
};

export default homeReducer;

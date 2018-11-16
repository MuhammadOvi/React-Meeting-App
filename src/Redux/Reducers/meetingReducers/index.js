const initialState = {
  meeting: {},
  personToMeet: {},
};

const meetingReducers = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_PERSON_TO_MEET': {
      return { ...state, personToMeet: action.personToMeet };
    }
    case 'REMOVE_PERSON_TO_MEET': {
      return { ...state, personToMeet: {} };
    }
    case 'SET_MEETING': {
      return { ...state, meeting: action.meeting };
    }
    case 'REMOVE_MEETING': {
      return { ...state, meeting: {} };
    }
    default: {
      return state;
    }
  }
};

export default meetingReducers;

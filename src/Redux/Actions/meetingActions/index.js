const setPersonToMeet = personToMeet => ({
  personToMeet,
  type: 'SET_PERSON_TO_MEET',
});

const removePersonToMeet = () => ({
  type: 'REMOVE_PERSON_TO_MEET',
});

const setMeeting = meeting => ({
  meeting,
  type: 'SET_MEETING',
});

const removeMeeting = () => ({
  type: 'REMOVE_MEETING',
});

export { setPersonToMeet, removePersonToMeet, setMeeting, removeMeeting };

export const START_TIMER = '@@timer.start';
export const STOP_TIMER = '@@timer.stop';

function stopTimer(uid, id, complete) {
  return {
    type: STOP_TIMER,
    payload: {
      uid,
      timer: id,
      complete,
    },
  };
}

function startTimer(uid, id, interval, now) {
  return {
    type: START_TIMER,
    payload: {
      uid,
      timer: id,
      start: now,
      end: now + interval,
    },
  };
}

export function reducer(state = {}, action) {
  switch (action.type) {
    case START_TIMER:
      return {
        ...action.payload,
        running: true,
      };
    case STOP_TIMER:
      return {
        ...state,
        ...action.payload,
        running: false,
      };
    default:
      return state;
  }
}

export function createTimer(dispatch, uid) {
  let handle = null;

  return {
    setup: (id, interval, actionCreator) => {
      if (handle) {
        throw new Error(`Timer ${handle.id} is already running`);
      }

      handle = {
        id,
        timer: setTimeout(() => {
          dispatch(stopTimer(uid, id, true));
          handle = null;
          dispatch(actionCreator());
        }, interval),
      };

      dispatch(startTimer(uid, id, interval, Date.now()));
    },

    clear: () => {
      if (handle === null) {
        throw new Error('No timer to clear');
      }

      clearTimeout(handle.timer);
      dispatch(stopTimer(uid, handle.id, false));
      handle = null;
    },
  };
}

# redux-thunkx-timer
A controlled timer for running future actions

# Usage
```javascript
import { createThunkx } from 'redux-thunkx';
import { createTimer } from 'redux-thunkx-timer';

const thunkx = createThunkx((dispatch) => ({
  timer: createTimer(dispatch, '__DEF__');
}));

// Somewhere in the thunked actions

const login = (dispatch, getState, { timer }) => {
  if (getState().users.length === 3) {
    timer.setup('wait', 1000, startGame);
  }
}

const logout = (dispatch, getState, { timer }) => {
  if (getState().users.length === 2) {
    timer.clear();
  }
}

```

## Use the default reducer to update the timer information
```javascript
import { reducer } from 'redux-thunkx-timer';

const rootReducer = combineReducers({
  timeout: reducer,
  app: appReducer,
});
```

## Add hooks to fix the timestamps (for redux-session-server)
```javascript
import { START_TIMER, STOP_TIMER } from 'redux-thunkx-timer'
import { registerActionHook } from 'redux-session-server';

registerActionHook(START_TIMER, {
  // Fix the timestamps for each session
  sanitize: (action, session) => ({
    ...action,
    payload: {
      ...action.payload,
      start: action.payload.start - session.delta,
      end: action.payload.end - session.delta,
    },
  }),
});

registerActionHook(STOP_TIMER, {
  // Remove the START_TIMER actions, for every STOP_TIMER
  // To stop overcrowding
  preProcess: (action, actions) => ({
    actions.removeOne(a => a.type === START_TIMER);
    return action;
  });
});

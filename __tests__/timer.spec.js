import { START_TIMER, STOP_TIMER, createTimer, reducer } from '../src';

jest.useFakeTimers();

describe('library', () => {
  test('must export', () => {
    expect(typeof START_TIMER).toBe('string');
    expect(typeof STOP_TIMER).toBe('string');
    expect(typeof createTimer).toBe('function');
    expect(typeof reducer).toBe('function');

    expect(createTimer.length).toBe(2);
  });

  describe('reducer', () => {
    test('must handle START_TIMER', () => {
      const payload = { lol: true };
      expect(reducer(undefined, { type: START_TIMER, payload })).toMatchObject({
        ...payload,
        running: true,
      });
    });

    test('must handle STOP_TIMER', () => {
      const payload = { lol: false };
      expect(reducer(undefined, { type: STOP_TIMER, payload })).toMatchObject({
        ...payload,
        running: false,
      });
    });
  });

  describe('createTimer', () => {
    const doDispatch = jest.fn();
    const uid = '__DEF__';
    const timer = createTimer(doDispatch, uid);

    test('must return object', () => {
      expect(typeof timer).toBe('object');
      expect(typeof timer.setup).toBe('function');
      expect(typeof timer.clear).toBe('function');
      expect(timer.setup.length).toBe(3);
      expect(timer.clear.length).toBe(0);
    });

    describe('setup', () => {
      const id = 'dummy';
      const interval = 1000;
      const actionCreator = jest.fn();
      test('must start a timeout dispatching START_TIMER action', () => {
        const ts = Date.now();
        timer.setup(id, interval, actionCreator);

        expect(doDispatch.mock.calls).toHaveLength(1);
        const obj = doDispatch.mock.calls[0][0];
        expect(obj).toMatchObject({
          type: START_TIMER,
          payload: {
            uid,
            timer: id,
          },
        });
        expect(obj.payload.start).toBeGreaterThanOrEqual(ts);
        expect(obj.payload.start).toBeLessThanOrEqual(Date.now());
        expect(obj.payload.end).toBe(obj.payload.start + interval);

        // Setting up a timer again must throw
        expect(() => timer.setup(id, interval, actionCreator)).toThrow();

        // Run the timer and check if the action creator is run
        expect(actionCreator.mock.calls).toHaveLength(0);
      });

      test('must run actionCreator and dispatched stop timer', () => {
        jest.runAllTimers();
        expect(actionCreator.mock.calls).toHaveLength(1);
        expect(doDispatch.mock.calls).toHaveLength(3); // start, stop, actionCreator
        expect(doDispatch.mock.calls[1][0]).toMatchObject({
          type: STOP_TIMER,
          payload: { uid, timer: id, complete: true },
        });
      });
    });

    describe('clear', () => {
      const id = 'forClear';
      const interval = 1000;
      const actionCreator = jest.fn();

      test('must throw when no timer is running', () => {
        expect(() => timer.clear()).toThrow();
      });

      test('must dispatch STOP_TIMER', () => {
        timer.setup(id, interval, actionCreator);
        timer.clear();

        expect(doDispatch.mock.calls).toHaveLength(5);
        expect(doDispatch.mock.calls[4][0]).toMatchObject({
          type: STOP_TIMER,
          payload: { uid, timer: id, complete: false },
        });
      });

      test('timeouts must have been cancelled', () => {
        jest.runAllTimers();
        expect(doDispatch.mock.calls).toHaveLength(5);
      });
    });
  });
});

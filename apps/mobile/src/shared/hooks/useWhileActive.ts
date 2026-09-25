import { useEffect } from 'react';
import { AppState } from 'react-native';

/**
 * Like `useEffect`, but the effect only runs while the app is in the
 * foreground: it is torn down when the app is backgrounded and set up again on
 * return.
 *
 * Use it for endless decorative work — looping reanimated animations, ticking
 * timers. Reanimated keeps applying props on the UI thread for as long as an
 * animation is running, so a `withRepeat(..., -1)` loop never lets that work
 * end. Once the app is backgrounded the UI thread stops receiving frames while
 * updates keep queueing, and Android eventually reports a "Background ANR"
 * (Sentry: ApplicationNotResponding at SynchronousPropsBufferParser.parse →
 * NativeProxy.synchronouslyUpdateUIProps). An idle flourish nobody can see is
 * not worth an ANR, so it is stopped instead.
 *
 * The teardown returned by `effect` must fully stop the work — `cancelAnimation`
 * on every shared value a loop drives, `clearInterval` on a timer.
 */
export function useWhileActive(effect: () => (() => void) | void, deps: unknown[] = []) {
  useEffect(() => {
    let teardown: (() => void) | void;

    const run = () => {
      if (!teardown) teardown = effect();
    };
    const halt = () => {
      teardown?.();
      teardown = undefined;
    };

    if (AppState.currentState === 'active') run();

    // 'inactive' (iOS multitasking / incoming call) counts as not visible too.
    const subscription = AppState.addEventListener('change', (state) =>
      state === 'active' ? run() : halt()
    );

    return () => {
      subscription.remove();
      halt();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

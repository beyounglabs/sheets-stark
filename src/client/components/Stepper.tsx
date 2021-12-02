import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from 'react';

import './stepper.css';

type TStepperContext = {
  steps: string[];
  current: number;
  next: () => void;
  previous: () => void;
};

const StepperContext = createContext<TStepperContext>({
  steps: [],
  current: 0,
  next: () => {},
  previous: () => {},
});

type State = Pick<TStepperContext, 'steps' | 'current'>;

type Action =
  | {
      type: 'NEXT';
    }
  | {
      type: 'PREVIOUS';
    };

function reducer(state: State, action: Action) {
  if (action.type === 'NEXT') {
    return {
      ...state,
      current: Math.min(state.steps.length - 1, state.current + 1),
    };
  }

  if (action.type === 'PREVIOUS') {
    return {
      ...state,
      current: Math.max(0, state.current - 1),
    };
  }

  return state;
}

export function StepperProvider({
  children,
  steps,
}: PropsWithChildren<{ steps: string[] }>) {
  const [state, send] = useReducer<typeof reducer, string[]>(
    reducer,
    steps,
    (steps) => ({
      steps,
      current: 0,
    })
  );

  const next = useCallback<TStepperContext['next']>(() => {
    send({ type: 'NEXT' });
  }, []);

  const previous = useCallback<TStepperContext['previous']>(() => {
    send({ type: 'PREVIOUS' });
  }, []);

  const context = useMemo(
    () => ({
      ...state,
      next,
      previous,
    }),
    [state, next, previous]
  );

  return (
    <StepperContext.Provider value={context}>
      {children}
    </StepperContext.Provider>
  );
}

export function useStepper() {
  return useContext(StepperContext);
}

export function Stepper() {
  const { steps, current } = useStepper();

  return (
    <div className="stepper">
      <div className="stepper-progress">
        {current + 1}/{steps.length}
      </div>
      <div className="stepper-description">{steps[current]}</div>
    </div>
  );
}

import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { useCache } from './useCache';

type TRouteContext = {
  route: string;
  data: Record<string, any> | null;
  history: Array<[string, TRouteContext['data']]>;
  navigate: (to: string, data?: TRouteContext['data']) => void;
  match: (route: string) => boolean;
  back: () => void;
};

const RouterContext = createContext<TRouteContext>({
  route: '/',
  history: [],
  data: null,
  navigate: () => {},
  match: () => false,
  back: () => {},
});

type Action =
  | {
      type: 'NAVIGATE';
      to: string;
      data?: TRouteContext['data'];
    }
  | {
      type: 'BACK';
    };

type State = Pick<TRouteContext, 'route' | 'history' | 'data'>;

function reducer(state: State, action: Action) {
  if (action.type === 'NAVIGATE') {
    const history = [...state.history];

    history.push([state.route, state.data]);

    return {
      route: action.to,
      data: action.data || null,
      history,
    };
  }

  if (action.type === 'BACK') {
    const [route, data] = state.history[state.history.length - 1] || [
      state.route,
      state.data,
    ];

    return {
      route,
      data: data || null,
      history: state.history.slice(0, state.history.length - 1),
    };
  }

  return state;
}

export function Router({
  children,
  debug = false,
}: PropsWithChildren<{ debug?: boolean }>) {
  const [getCache, setData] = useCache(
    '@router/state',
    (null as any) as State,
    {
      route: '/',
      data: null,
      history: [] as State['history'],
    }
  );

  const [state, send] = useReducer(reducer, undefined, () => {
    const router = getCache();

    return {
      route: router.route || '/',
      data: router.data || null,
      history: router.history || [],
    };
  });

  useEffect(() => {
    setData(state);
  }, [state]);

  const navigate = useCallback<TRouteContext['navigate']>((to, data) => {
    send({ type: 'NAVIGATE', to, data });
  }, []);

  const match = useCallback<TRouteContext['match']>(
    (route) => route === state.route,
    [state.route]
  );

  const back = useCallback<TRouteContext['back']>(() => {
    send({ type: 'BACK' });
  }, []);

  const context = useMemo(
    () => ({
      ...state,
      navigate,
      back,
      match,
    }),
    [state, navigate, back, match]
  );

  return (
    <RouterContext.Provider value={context}>
      {debug ? <pre key="debug">{JSON.stringify(state, null, 2)}</pre> : null}
      <React.Fragment key="children">{children}</React.Fragment>
    </RouterContext.Provider>
  );
}

export function useRouter() {
  return useContext(RouterContext);
}

export function Route({ path, children }: PropsWithChildren<{ path: string }>) {
  const { match } = useRouter();

  if (match(path)) {
    return <>{children}</>;
  }

  return null;
}

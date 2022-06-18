type Subscriber<T> = (value: T) => void;

type Unsubscriber = () => void;

export interface Store<T> {
  subscribe(fn: Subscriber<T>): Unsubscriber;
  set(value: T): void;
}

export function store<T>(value: T): Store<T> {
  const subscribers: Array<Subscriber<T>> = [];

  function subscribe(fn: Subscriber<T>): Unsubscriber {
    subscribers.push(fn);
    fn(value);
    return () => {
      const index = subscribers.indexOf(fn);
      if (index !== -1) {
        subscribers.splice(index, 1);
      }
    };
  }

  function set(new_value: T) {
    if (new_value !== value) {
      value = new_value;
      subscribers.forEach((subscriber) => {
        subscriber(value);
      });
    }
  }

  return {
    set,
    subscribe,
  };
}

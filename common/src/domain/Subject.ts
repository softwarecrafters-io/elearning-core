import { Maybe } from './Maybe';

type Subscriber<T> = (value: T) => void;
type Unsubscribe = () => void;

export class Subject<T> {
  private subscribers: Set<Subscriber<T>> = new Set();

  private constructor(private currentValue: Maybe<T>) {}

  static create<T>(): Subject<T> {
    return new Subject(Maybe.none());
  }

  static createWithInitial<T>(value: T): Subject<T> {
    return new Subject(Maybe.some(value));
  }

  subscribe(subscriber: Subscriber<T>): Unsubscribe {
    this.subscribers.add(subscriber);
    this.currentValue.fold(
      () => {},
      (value) => subscriber(value)
    );
    return () => this.subscribers.delete(subscriber);
  }

  next(value: T): void {
    this.currentValue = Maybe.some(value);
    this.subscribers.forEach((subscriber) => subscriber(value));
  }

  value(): Maybe<T> {
    return this.currentValue;
  }
}

import { Subject } from '../src/domain/Subject';

describe('The Subject', () => {
  describe('Constructors', () => {
    it('has no value when created empty', () => {
      const subject = Subject.create<number>();

      const result = subject.value();

      expect(result.isNone()).toBe(true);
    });

    it('holds the initial value when created with one', () => {
      const subject = Subject.createWithInitial(42);

      const result = subject.value();

      expect(result.isSome()).toBe(true);
      expect(result.getOrElse(0)).toBe(42);
    });
  });

  describe('Emitting values', () => {
    it('stores the emitted value', () => {
      const subject = Subject.create<number>();

      subject.next(100);

      expect(subject.value().getOrElse(0)).toBe(100);
    });
  });

  describe('Subscriptions', () => {
    it('delivers initial value to new subscribers immediately', () => {
      const subject = Subject.createWithInitial(42);
      const received: number[] = [];

      subject.subscribe((value) => received.push(value));

      expect(received).toEqual([42]);
    });

    it('waits for emissions when created empty', () => {
      const subject = Subject.create<number>();
      const received: number[] = [];

      subject.subscribe((value) => received.push(value));

      expect(received).toEqual([]);
    });

    it('delivers emitted values to subscribers', () => {
      const subject = Subject.create<number>();
      const received: number[] = [];
      subject.subscribe((value) => received.push(value));

      subject.next(100);

      expect(received).toEqual([100]);
    });

    it('ignores emissions after unsubscription', () => {
      const subject = Subject.create<number>();
      const received: number[] = [];
      const unsubscribe = subject.subscribe((value) => received.push(value));
      subject.next(1);

      unsubscribe();
      subject.next(2);

      expect(received).toEqual([1]);
    });

    it('broadcasts emissions to all subscribers', () => {
      const subject = Subject.create<number>();
      const received1: number[] = [];
      const received2: number[] = [];
      subject.subscribe((value) => received1.push(value));
      subject.subscribe((value) => received2.push(value));

      subject.next(42);

      expect(received1).toEqual([42]);
      expect(received2).toEqual([42]);
    });
  });
});

/**
 * Atomic sequence counters.
 *
 * A tiny collection of named counters used to hand out monotonically
 * increasing integers (e.g. the human-friendly listing number shown to users).
 * `getNextSequence` uses an atomic `$inc` + `upsert` so concurrent callers
 * never receive the same value.
 */
import { Schema, model, type Model } from 'mongoose';

interface CounterDoc {
  _id: string; // counter name, e.g. 'property'
  seq: number;
}

const counterSchema = new Schema<CounterDoc>({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export const Counter: Model<CounterDoc> = model<CounterDoc>('Counter', counterSchema);

/**
 * Returns the next integer for the named counter, creating it at 1 on first use.
 * Atomic — safe under concurrency. Note: if the caller's subsequent write fails,
 * the number is "spent" and a gap appears. That is acceptable for display IDs.
 */
export async function getNextSequence(name: string): Promise<number> {
  const counter = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter!.seq;
}

import { createSignal } from "solid-js";

export default function Counter() {
  const [count, setCount] = createSignal(0);
  return (
    <button
      class="inline-flex items-center justify-center min-h-[2.9rem] px-4.5 py-3 rounded-full border border-transparent cursor-pointer transition-all duration-150 hover:-translate-y-px bg-[linear-gradient(135deg,var(--color-primary),#83f0da)] text-[#08111f] font-bold"
      onClick={() => setCount(count() + 1)}
      type="button"
    >
      Clicks: {count()}
    </button>
  );
}

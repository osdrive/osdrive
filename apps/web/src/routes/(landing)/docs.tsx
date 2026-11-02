import { Link, Meta, Title } from "@solidjs/meta";

export default function Page() {
  return (
    <main class="flex-1 flex items-center justify-center px-8 py-24">
      <Title>Docs — OSDrive</Title>
      <Meta
        name="description"
        content="Documentation for OSDrive, the cloud drive that mounts your storage natively and syncs across every device."
      />
      <Link rel="canonical" href="https://osdrive.app/docs" />
      <div class="text-center max-w-sm">
        <p class="text-xs text-stone-400 uppercase tracking-[0.2em] mb-7">Documentation</p>
        <h1 class="text-5xl font-light tracking-tight text-stone-900 leading-tight mb-5">
          Docs coming soon.
        </h1>
        <p class="text-stone-500 text-sm leading-relaxed">
          We're in the den cooking up some killer docs. If you've got questions just reach out!
        </p>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-edu-bg px-6 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-inc-violet text-sm font-semibold text-white">
        IN
      </div>
      <h1 className="text-2xl font-bold text-white">INCADEducativa</h1>
      <p className="max-w-md text-sm text-white/55">
        Plataforma en construcción. Visitá{" "}
        <code className="rounded-sm bg-white/5 px-1.5 py-0.5 text-xs text-[--inc-violet-text]">
          /design-preview
        </code>{" "}
        para ver el catálogo de componentes del Design System v2.0.
      </p>
    </main>
  );
}

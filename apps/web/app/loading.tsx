export default function Loading() {
  return (
    <main
      className="mx-auto max-w-3xl px-8 py-16"
      aria-busy="true"
      aria-label="Carregando"
    >
      <div className="h-9 w-64 rounded-md bg-border motion-safe:animate-pulse" />
      <div className="mt-3 h-5 w-40 rounded-md bg-border motion-safe:animate-pulse" />
      <div className="mt-8 h-11 w-20 rounded-lg bg-border motion-safe:animate-pulse" />
    </main>
  );
}

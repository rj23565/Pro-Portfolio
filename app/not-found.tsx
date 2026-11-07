import Link from "next/link";
export default function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center bg-ivory p-6">
      <div className="max-w-md w-full rounded-[24px] bg-white border border-ink/10 p-8 text-center shadow-soft">
        <div className="mx-auto h-10 w-10 rounded-full bg-ivory-soft grid place-items-center">◈</div>
        <h1 className="mt-4 font-display text-2xl font-semibold">Page not found</h1>
        <p className="mt-2 text-sm text-ink/60">The page you’re looking for doesn’t exist.</p>
        <Link href="/" className="mt-6 inline-flex rounded-full bg-ink text-white px-6 py-2.5 text-sm font-medium">Back home</Link>
      </div>
    </div>
  );
}

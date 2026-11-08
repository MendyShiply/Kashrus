import Link from "next/link";
export default function NotFound() {
  return (
    <div className="container section narrow center">
      <h1>Page not found</h1>
      <Link className="btn btn-navy" href="/">Back home</Link>
    </div>
  );
}

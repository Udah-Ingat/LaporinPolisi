import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import Navbar from "./_components/Navbar";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }

  return (
    <HydrateClient>
      <main className="w-full bg-white">
        <Navbar />
      </main>
    </HydrateClient>
  );
}

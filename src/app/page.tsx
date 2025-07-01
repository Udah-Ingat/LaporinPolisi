import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }

  return (
    <HydrateClient>
      <main className="h-screen w-screen bg-black">
        <div className="h-1/3 w-1/3 rounded-2xl bg-white p-10">Testing</div>
      </main>
    </HydrateClient>
  );
}

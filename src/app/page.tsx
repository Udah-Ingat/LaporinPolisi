import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import Navbar from "./_components/Navbar";
import SearchBar from "./_components/SearchBar";
import PostList from "./_components/PostList";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }

  return (
    <HydrateClient>
      <main className="w-full bg-white">
        <SearchBar />
        <PostList />
        <Navbar />
      </main>
    </HydrateClient>
  );
}

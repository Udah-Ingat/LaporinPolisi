import { auth } from "@/server/auth";
import { HydrateClient } from "@/trpc/server";
import Navbar from "./_components/Navbar";
import SearchBar from "./_components/SearchBar";
import PostList from "./_components/PostList";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
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

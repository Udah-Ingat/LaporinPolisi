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
      <main className="relative flex flex-col items-between min-h-screen w-full bg-white pb-20">
        <SearchBar />
        <PostList />
        <Navbar />
      </main>
    </HydrateClient>
  );
}

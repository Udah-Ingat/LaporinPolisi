import { create } from "zustand";

type postResultType = {
  items: {
    id: string;
    title: string;
    city: string | null;
    imgUrl: string | null;
    updatedAt: string;
    isVerified: boolean;
    profileImgUrl: string;
    username: string;
    upVoteCount: number;
  }[];
  total: number;
  page: number;
  totalPages: number;
};

interface PostStore {
  posts: postResultType | null;
  setPosts: (posts: postResultType | undefined) => void;
  clearPosts: () => void;
}

export const usePostStore = create<PostStore>((set) => ({
  posts: null,
  setPosts: (posts) => set({ posts: posts }),
  clearPosts: () => set({ posts: null }),
}));

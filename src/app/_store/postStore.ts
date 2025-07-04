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
  page: number;
  setPosts: (posts: postResultType | undefined) => void;
  setPage: (page: number) => void;
  clearPosts: () => void;
}

export const usePostStore = create<PostStore>((set) => ({
  posts: null,
  page: 1,
  setPosts: (posts) => set({ posts: posts }),
  setPage: (page) => set({ page: page }),
  clearPosts: () => set({ posts: null }),
}));

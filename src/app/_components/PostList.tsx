import React from "react";
import PostCard from "./PostCard";
import { type PostCardProps } from "./PostCard";

const testData: PostCardProps = {
  profileImageUrl:
    "https://lh3.googleusercontent.com/a/ACg8ocKxzeAWJ7scN3ZvNiO24dhduRR7AveoTlH3WDPehIBauZw3XSmI=s96-c",
  username: "Andi Farhan",
  location: "Bandung",
  dateTime: "2025-04-03 : 13.59",
  postImageUrl: "/download.jpg",
  postContent:
    "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quo molestiae ipsum dolorem deserunt eum doloremque, aut architecto expedita culpa ipsa.",
  upvoteCount: 20000,
  isVerified: true,
};

const PostList = () => {
  return (
    <div>
      <div className="flex flex-col items-center justify-center gap-3">
        <PostCard {...testData} />
        <PostCard {...testData} />
        <PostCard {...testData} />
        <PostCard {...testData} />
      </div>
    </div>
  );
};

export default PostList;

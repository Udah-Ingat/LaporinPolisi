import Image from "next/image";
import Link from "next/link";
import React from "react";
import HomeIcon from "public/home_icon.svg"
import CreateIcon from "public/create_icon.svg";
import ProfileIcon from "public/profile_icon.svg";

const Navbar = () => {
  return (
    <div className="fixed bottom-0 max-w-md w-screen z-10 overflow-x-hidden bg-white py-3 shadow-md/30">
      <div className="flex items-center justify-around">
        <Link href={"/"}>
          <Image
            src={HomeIcon as string}
            alt="home icon"
            width="28"
            height="28"
          ></Image>
        </Link>
        <Link href={"/create"}>
          <Image
            src={CreateIcon as string}
            alt="create icon"
            width="28"
            height="28"
          ></Image>
        </Link>
        <Link href={"/profile"}>
          <Image
            src={ProfileIcon as string}
            alt="profile icon"
            width="28"
            height="28"
          ></Image>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;

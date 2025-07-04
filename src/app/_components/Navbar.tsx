import Image from "next/image";
import Link from "next/link";
import React from "react";

const Navbar = () => {
  return (
    <div className="fixed bottom-0 max-w-md w-screen z-10 overflow-x-hidden bg-white py-3 shadow-md/30">
      <div className="flex items-center justify-around">
        <Link href={"/"}>
          <Image
            src="home_icon.svg"
            alt="home icon"
            width="28"
            height="28"
          ></Image>
        </Link>
        <Link href={"/create"}>
          <Image
            src="create_icon.svg"
            alt="create icon"
            width="28"
            height="28"
          ></Image>
        </Link>
        <Link href={"/profile"}>
          <Image
            src="profile_icon.svg"
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

import Image from "next/image";
import React from "react";

const Navbar = () => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-around">
        <Image
          src="home_icon.svg"
          alt="home icon"
          width="28"
          height="28"
        ></Image>
        <Image
          src="create_icon.svg"
          alt="create icon"
          width="28"
          height="28"
        ></Image>
        <Image
          src="profile_icon.svg"
          alt="profile icon"
          width="28"
          height="28"
        ></Image>
      </div>
    </div>
  );
};

export default Navbar;

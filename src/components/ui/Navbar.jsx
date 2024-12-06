'use client';
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const Navbar = () => {
  const { user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav className="navbar bg-base-100 flex justify-between gap-2 backdrop-blur-xl shadow-lg fixed top-0 w-full z-50">
      <Link
        href="/"
        className="btn hover:bg-white text-xl bg-white text-[#7480FF] shadow-md "
      >
        Image World
      </Link>

      <ul className="menu menu-horizontal flex-1 justify-center px-1">
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/gallery">Gallery</Link>
        </li>
        <li>
          <Link href="/about">About Us</Link>
        </li>
        {user && (
          <li>
            <Link href="/create">Create</Link>
          </li>
        )}
      </ul>

      {!user ? (
        <Link href="/auth/signin" className="btn btn-primary">
          Login
        </Link>
      ) : (
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle avatar"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="w-10 rounded-full">
              <Image
                alt="User profile"
                src={user.photoURL || "/default-avatar.png"}
                width={100}
                height={100}
              />
            </div>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
          >
            <li>
              <Link href='/profile' className="justify-between">
                Profile
              </Link>
            </li>
            <li>
              <Link href='/profile/settings'>
                Settings
              </Link>
            </li>
            <li>
              <button onClick={() => signOut(auth)}>
                Logout
              </button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

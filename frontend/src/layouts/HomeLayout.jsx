import React from "react";
import { Outlet } from "react-router-dom";
import HomeNavBar from "../components/homeNavBar";

const HomeLayout = () => {
  return (
    <>
      <HomeNavBar />
      <Outlet />
    </>
  );
};

export default HomeLayout;

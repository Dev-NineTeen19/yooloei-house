import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import BottomNavbar from "../components/common/BottomNavbar";

export default function MainLayout() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: "calc(100vh - 75px)" }}>
        <Outlet />
      </main>
      <Footer />
      <BottomNavbar />
    </>
  );
}

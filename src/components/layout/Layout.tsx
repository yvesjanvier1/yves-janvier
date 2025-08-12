
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import SkipNavigation from "../accessibility/SkipNavigation";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <SkipNavigation />
      <Navbar />
      <main id="main-content" className="flex-grow" role="main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;

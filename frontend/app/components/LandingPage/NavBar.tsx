import { useState } from "react";
import LanguageToggle from "./LanguageToggle";

const NavBar = () => {
    const [open, setOpen] = useState(false);

    return (
        <header className="z-10 bg-transparent flex items-center h-[12vh] w-full px-6 md:px-24">
            {/* Logo */}
            <h3 className="text-white text-2xl font-bold">Logo</h3>

            {/* Desktop Menu */}
            <nav className="hidden md:block mx-12">
                <ul className="flex flex-row gap-6">
                    <li><a className="fancy-link text-xl font-semibold" href="#">Home</a></li>
                    <li><a className="fancy-link text-xl font-semibold" href="#">Quiz</a></li>
                    <li><a className="fancy-link text-xl font-semibold" href="#">Learn</a></li>
                    <li><a className="fancy-link text-xl font-semibold" href="#">Q&A</a></li>
                </ul>
            </nav>

            {/* Desktop right-side controls */}
            <div className="hidden md:flex items-center gap-6 ml-auto">
                <LanguageToggle />
                <button className="btn-primary">
                    Se connecter (auto-école)
                </button>
            </div>

            {/* Mobile Hamburger */}
            <button
                className="md:hidden ml-auto text-white text-3xl"
                onClick={() => setOpen(!open)}
            >
                ☰
            </button>

            {/* Mobile Menu (Dropdown) */}
            {open && (
                <div className="absolute top-[12vh] left-0 w-full bg-black/80 backdrop-blur-lg md:hidden flex flex-col items-center gap-4 py-6">
                    <a className="fancy-link text-xl text-white" href="#">Home</a>
                    <a className="fancy-link text-xl text-white" href="#">Quiz</a>
                    <a className="fancy-link text-xl text-white" href="#">Learn</a>
                    <a className="fancy-link text-xl text-white" href="#">Q&A</a>

                    <LanguageToggle />
                    <button className="btn-primary mt-2">
                        Se connecter (auto-école)
                    </button>
                </div>
            )}
        </header>
    );
};

export default NavBar;

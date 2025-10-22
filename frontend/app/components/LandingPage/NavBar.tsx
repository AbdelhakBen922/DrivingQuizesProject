import LanguageToggle from "./LanguageToggle"

const NavBar = () => {
    return (
        <header className="z-10  bg-transparent flex flex-row items-center h-[15vh] w-full px-24">
            <h3 className="text-white ">Logo</h3>
            <nav>
                <ul className="flex flex-row gap-4 mx-12 ">
                    <li><a className="fancy-link text-2xl font-semibold" href="#">Home</a></li>
                    <li><a className="fancy-link text-2xl font-semibold" href="#">Quiz</a></li>
                    <li><a className="fancy-link text-2xl font-semibold" href="#">Learn</a></li>
                    <li><a className="fancy-link text-2xl font-semibold" href="#">Q&A</a></li>
                </ul>
            </nav>
            <div className="ml-auto">
                <LanguageToggle />
            </div>
            <button className="btn-primary mx-10">
                Se connecter (auto-école)
            </button>
        </header>
    )
}

export default NavBar
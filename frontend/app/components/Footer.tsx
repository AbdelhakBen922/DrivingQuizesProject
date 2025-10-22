
const ItemsListBuilder = ({ title, items }: { title: string; items: string[] }) => {
  return (
    <div className="flex flex-col gap-2 ">
      <h4 className="text-primary-300 font-bold">{title}</h4>
      <ul className="list-none flex flex-col gap-1">
        {items.map((item, index) => (
          <li key={index} >
            <a href="#">{item}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="bg-primary-800 text-white py-10 pt-10  px-24 flex flex-col gap-16">
        <div className=" flex flex-col md:flex-row justify-between gap-16">
          <ItemsListBuilder title="Plateforme" items={["Accueil", "Quiz", "Cours", "coté auto-écoles"]} />
          <ItemsListBuilder title="Pour les élèves" items={["Commencer à apprendre", "Suivre mes progrès", "Conseils & astuces","Guide du code"]} />
          <ItemsListBuilder title="Pour les auto-écoles" items={["Espace auto-école", "Gérer vos élèves", "Statistiques & performances","Devenir partenaire"]} />
          <ItemsListBuilder title="Support" items={["FAQ", "Contactez-nous", "Centre d’aide","Mentions légales"]} />
        </div>
        <div className="flex flex-col justify-center items-center md:flex-row ">
            <h4 className="text-primary-100 ">Logo</h4>
            <p className="font-bold text-xl mx-auto" >© 2005 — Tous droits réservés.</p>
            <div className="flex flex-row gap-2">
              <a href="#" className="text-primary-100">
                <img src="/assets/icons/instagram.svg" alt="Instagram" />
              </a>
              <a href="#" className="text-primary-100">
                <img src="/assets/icons/tiktok.svg" alt="TikTok" />
              </a>
              <a href="#" className="text-primary-100">
                <img src="/assets/icons/facebook.svg" alt="Facebook" />
              </a>
            </div>
        </div>
    </footer>
  )
}

export default Footer
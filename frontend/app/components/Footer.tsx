import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  return (
    <footer className="bg-primary-800 text-white py-8 pt-8 px-12 sm:py-10 sm:pt-10  sm:px-24 flex flex-col sm:gap-16">
        <div className=" flex flex-col md:flex-row justify-between gap-16">
          <ItemsListBuilder title={t('footer.platform')} items={t('footer.platformItems', { returnObjects: true }) as string[]} />
          <ItemsListBuilder title={t('footer.students')} items={t('footer.studentsItems', { returnObjects: true }) as string[]} />
          <ItemsListBuilder title={t('footer.schools')} items={t('footer.schoolsItems', { returnObjects: true }) as string[]} />
          <ItemsListBuilder title={t('footer.support')} items={t('footer.supportItems', { returnObjects: true }) as string[]} />
        </div>
        <div className="flex flex-col justify-center items-center md:flex-row ">
            <h4 className="text-primary-100 ">Logo</h4>
            <p className="font-bold text-xl mx-auto" >{t('footer.copyright')}</p>
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

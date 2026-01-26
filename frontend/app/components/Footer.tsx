import { useTranslation } from "react-i18next";
import { Link } from "react-router";

const ItemsListBuilder = ({ title, items, links }: { title: string; items: string[]; links: string[] }) => {
  return (
    <div className="flex flex-col gap-2 ">
      <h4 className="text-primary-300 font-bold">{title}</h4>
      <ul className="list-none flex flex-col gap-1">
        {items.map((item, index) => (
          <li key={index} >
            {links[index].startsWith('#') ? (
              <a href={links[index]} className="hover:text-primary-200 transition-colors">{item}</a>
            ) : links[index].startsWith('/') ? (
              <Link to={links[index]} className="hover:text-primary-200 transition-colors">{item}</Link>
            ) : (
              <a href={links[index]} className="hover:text-primary-200 transition-colors">{item}</a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

const Footer = () => {
  const { t } = useTranslation();
  
  // Platform links: Home, Quiz, Learn, School Side
  const platformLinks = ['#hero', '/select-quiz', '#learning-preview', '/login?type=school'];
  
  // Student links: Start Learning, Track Progress, Tips & Tricks, Code Guide
  const studentLinks = ['#learning-preview', '/login?type=student', '#faq', '#learning-preview'];
  
  // School links: School Space, Manage Students, Statistics & Performance, Become Partner
  const schoolLinks = ['/login?type=school', '/login?type=school', '/login?type=school', '/contact'];
  
  // Support links: FAQ, Contact Us, Help Center, Legal Notice
  const supportLinks = ['#faq', '/contact', '/contact', '#legal'];
  
  return (
    <footer className="bg-primary-800 text-white py-8 pt-8 px-12 sm:py-10 sm:pt-10  sm:px-24 flex flex-col sm:gap-16">
        <div className=" flex flex-col md:flex-row justify-between gap-16">
          <ItemsListBuilder title={t('footer.platform')} items={t('footer.platformItems', { returnObjects: true }) as string[]} links={platformLinks} />
          <ItemsListBuilder title={t('footer.students')} items={t('footer.studentsItems', { returnObjects: true }) as string[]} links={studentLinks} />
          <ItemsListBuilder title={t('footer.schools')} items={t('footer.schoolsItems', { returnObjects: true }) as string[]} links={schoolLinks} />
          <ItemsListBuilder title={t('footer.support')} items={t('footer.supportItems', { returnObjects: true }) as string[]} links={supportLinks} />
        </div>
        <div className="flex flex-col justify-center items-center md:flex-row ">
            <img src="/assets/images/Logo-clean-dark.png" alt="Logo" className="h-12 w-auto mb-4 md:mb-0 md:mr-4" />
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

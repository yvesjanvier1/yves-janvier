
import { Link, useParams } from "react-router-dom";
import { Github, Linkedin, Mail } from "lucide-react";
import { NewsletterSubscription } from "@/components/newsletter/NewsletterSubscription";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { lang = 'fr' } = useParams();
  const { t } = useLanguage();
  
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Yves Janvier</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {t('footer.description') || "Full Stack Developer & Data Engineer creating innovative digital solutions."}
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="mailto:contact@yvesjanvier.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.quickLinks') || "Quick Links"}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to={`/${lang}/about`} className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('nav.about') || "About"}
                </Link>
              </li>
              <li>
                <Link to={`/${lang}/work/portfolio`} className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('nav.portfolio') || "Portfolio"}
                </Link>
              </li>
              <li>
                <Link to={`/${lang}/content/blog`} className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('nav.blog') || "Blog"}
                </Link>
              </li>
              <li>
                <Link to={`/${lang}/content/now`} className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('nav.now') || "Now"}
                </Link>
              </li>
              <li>
                <Link to={`/${lang}/contact`} className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('nav.contact') || "Contact"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">{t('nav.resources') || "Resources"}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to={`/${lang}/resources/downloads`} className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('resources.downloads.title') || "Downloads"}
                </Link>
              </li>
              <li>
                <Link to={`/${lang}/content/journal`} className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('nav.journal') || "Journal"}
                </Link>
              </li>
              <li>
                <Link to={`/${lang}/resources/guides`} className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('resources.guides.title') || "Guides"}
                </Link>
              </li>
              <li>
                <Link to={`/${lang}/resources/tools`} className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('resources.tools.title') || "Tools"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.stayUpdated') || "Stay Updated"}</h4>
            <NewsletterSubscription variant="footer" />
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Yves Janvier. {t('footer.allRightsReserved') || "All rights reserved."}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

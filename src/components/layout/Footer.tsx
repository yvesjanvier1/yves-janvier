import { Link } from "react-router-dom";
import { Github, Linkedin, Mail } from "lucide-react";
import { NewsletterSubscription } from "@/components/newsletter/NewsletterSubscription";
import { useLanguage } from "@/contexts/LanguageContext";
import { appRoutes } from "@/router/routes";

interface FooterProps {
  translations?: Record<string, any>;
}

const Footer = ({ translations }: FooterProps) => {
  const { t } = useLanguage();

  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Yves Janvier</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {t("footer.description") ||
                "Full Stack Developer & Data Engineer creating innovative digital solutions."}
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
            <h4 className="font-semibold mb-4">{t("footer.quickLinks") || "Quick Links"}</h4>
            <ul className="space-y-2 text-sm">
              {appRoutes.about.items.slice(0, 1).map((item) => (
                <li key={item.nameKey}>
                  <Link
                    to={item.path}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t(item.nameKey)}
                  </Link>
                </li>
              ))}
              {appRoutes.work.items.slice(0, 1).map((item) => (
                <li key={item.nameKey}>
                  <Link
                    to={item.path}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t(item.nameKey)}
                  </Link>
                </li>
              ))}
              {appRoutes.content.items.filter((_, i) => i === 0 || i === 2).map((item) => (
                <li key={item.nameKey}>
                  <Link
                    to={item.path}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t(item.nameKey)}
                  </Link>
                </li>
              ))}
              {appRoutes.about.items.slice(2, 3).map((item) => (
                <li key={item.nameKey}>
                  <Link
                    to={item.path}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t(item.nameKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">{t(appRoutes.resources.titleKey)}</h4>
            <ul className="space-y-2 text-sm">
              {[3, 2, 1].map((i) => {
                const item = appRoutes.resources.items[i];
                return (
                  <li key={item.nameKey}>
                    <Link
                      to={item.path}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t(item.nameKey)}
                    </Link>
                  </li>
                );
              })}
              {/* Include journal link */}
              <li>
                <Link
                  to={appRoutes.content.items[1].path}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t(appRoutes.content.items[1].nameKey)}
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-4">{t("footer.stayUpdated") || "Stay Updated"}</h4>
            <NewsletterSubscription variant="footer" />
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Yves Janvier.{" "}
            {t("footer.allRightsReserved") || "All rights reserved."}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

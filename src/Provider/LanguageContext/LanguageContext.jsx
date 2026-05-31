import { createContext, useContext, useEffect, useState } from "react";
import i18n from "../../i18n";

const LanguageContext = createContext();

// eslint-disable-next-line react/prop-types
export const LanguageProvider = ({ children }) => {
  const [language] = useState("bn");

  useEffect(() => {
    i18n.changeLanguage("bn");
    localStorage.setItem("lang", "bn");
    localStorage.setItem("i18nextLng", "bn");
    document.documentElement.lang = "bn";
  }, []);

  const toggleLanguage = () => {
    i18n.changeLanguage("bn");
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

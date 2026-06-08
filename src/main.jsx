import React from "react";
import ReactDOM from "react-dom/client";
import {  RouterProvider } from "react-router-dom";
import "./index.css";
import { router } from "./Routes/Routes";
import "./i18n";
import { LanguageProvider } from "./Provider/LanguageContext/LanguageContext";
import GetUserProfile from "./providers/getUserProfile/getUserProfile";


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LanguageProvider>
      {" "}
      <GetUserProfile>
        {" "}
        <RouterProvider router={router} />
      </GetUserProfile>
    </LanguageProvider>{" "}
  </React.StrictMode>
);

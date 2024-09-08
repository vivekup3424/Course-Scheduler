import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import themeOverride from "./theme";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ColorModeScript initialColorMode={themeOverride.config.initialColorMode} />
    <ChakraProvider theme={themeOverride} resetCSS>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);

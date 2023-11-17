import React from "react";
import type { ThemeContextType } from "~/utils/typs";

const ThemeContext = React.createContext<ThemeContextType>("light");

export const ThemeProvider = ThemeContext.Provider;

export const useTheme = () => React.useContext(ThemeContext);

// stores/theme.ts
import { defineStore } from "pinia";

export type ThemeName = "sage-green" | "dark-blue" | "light-pink";

export interface ThemeState {
  currentTheme: ThemeName;
  themes: ThemeName[];
  themeColors: Record<ThemeName, string>;
  lightThemeColors: Record<ThemeName, string>;
  extraLightThemeColors: Record<ThemeName, string>;
}

export const useThemeStore = defineStore("theme", {
  state: (): ThemeState => ({
    currentTheme: "sage-green",
    themes: ["sage-green", "dark-blue", "light-pink"],
    themeColors: {
      "sage-green": "#8A9A86",
      "dark-blue": "#1E3A8A",
      "light-pink": "#F9A8D4",
    },
    lightThemeColors: {
      "sage-green": "#D4DDD2",
      "dark-blue": "#B8C5E0",
      "light-pink": "#FCEEF6",
    },
    extraLightThemeColors: {
      "sage-green": "#E3E9E2",
      "dark-blue": "#D4DCF0",
      "light-pink": "#FEF6FA",
    },
  }),

  getters: {
    getCurrentThemeColor: (state): string =>
      state.themeColors[state.currentTheme],
    getCurrentLightThemeColor: (state): string =>
      state.lightThemeColors[state.currentTheme],
    getCurrentExtraLightThemeColor: (state): string =>
      state.extraLightThemeColors[state.currentTheme],
    getThemeColor:
      (state) =>
      (themeName: ThemeName): string =>
        state.themeColors[themeName],
    getLightThemeColor:
      (state) =>
      (themeName: ThemeName): string =>
        state.lightThemeColors[themeName],
    getExtraLightThemeColor:
      (state) =>
      (themeName: ThemeName): string =>
        state.extraLightThemeColors[themeName],
  },

  actions: {
    setTheme(newTheme: ThemeName): void {
      if (this.themes.includes(newTheme)) {
        this.currentTheme = newTheme;
        if (process.client) {
          document.documentElement.setAttribute("data-theme", newTheme);
          // Store in localStorage for persistence
          localStorage.setItem("selected-theme", newTheme);

          let metaThemeColor = document.querySelector(
            'meta[name="theme-color"]'
          ) as HTMLMetaElement | null;

          if (!metaThemeColor) {
            metaThemeColor = document.createElement("meta") as HTMLMetaElement;
            metaThemeColor.name = "theme-color";
            document.head.appendChild(metaThemeColor);
          }
          metaThemeColor.setAttribute(
            "content",
            this.themeColors[this.currentTheme]
          );

          // Update <body> background color
          document.body.style.backgroundColor =
            this.themeColors[this.currentTheme];
        }
      }
    },

    initializeTheme(): void {
      // import.meta.client
      if (process.client) {
        const savedTheme = localStorage.getItem(
          "selected-theme"
        ) as ThemeName | null;
        if (savedTheme && this.themes.includes(savedTheme)) {
          this.setTheme(savedTheme);
        } else {
          this.setTheme(this.currentTheme);
        }
      }
    },
  },
});

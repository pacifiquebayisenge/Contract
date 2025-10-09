// stores/theme.ts
import { defineStore } from "pinia";

export type ThemeName = "sage-green" | "dark-blue" | "light-pink";

export interface ThemeState {
  currentTheme: ThemeName;
  themes: ThemeName[];
  themeColors: Record<ThemeName, string>;
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
  }),

  getters: {
    getCurrentThemeColor: (state): string =>
      state.themeColors[state.currentTheme],
    getThemeColor:
      (state) =>
      (themeName: ThemeName): string =>
        state.themeColors[themeName],
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
          document!
            .querySelector('meta[name="theme-color"]')!
            .setAttribute("content", "#123456");
        }
      }
    },

    initializeTheme(): void {
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

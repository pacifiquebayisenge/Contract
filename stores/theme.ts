
// stores/theme.ts
import { defineStore } from "pinia";

export type ThemeName = "sage-green" | "dark-blue" | "light-pink";
export type LightThemeOptionName = "light-color" | "extra-light-color";
export type BadgeRingOption = 'inside' | 'outside';

export interface ThemeState {
  currentTheme: ThemeName;
  currentLightThemeOption: LightThemeOptionName;
  currentBadgeRingOption: BadgeRingOption

  themes: ThemeName[];
  lightThemeOptions: LightThemeOptionName[];

  themeColors: Record<ThemeName, string>;
  lightThemeColors: Record<ThemeName, string>;
  extraLightThemeColors: Record<ThemeName, string>;


  badgeRingOptions: BadgeRingOption[]
}

export const useThemeStore = defineStore("theme", {
  state: (): ThemeState => ({
    currentTheme: "sage-green",
    currentLightThemeOption: "light-color",
    currentBadgeRingOption: 'outside',


    themes: ["sage-green", "dark-blue", "light-pink"],
    lightThemeOptions: ["light-color", "extra-light-color"],
    badgeRingOptions: ['inside', 'outside'],

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
    // get the current theme colors variantions
    getCurrentThemeColor: (state): string =>
      state.themeColors[state.currentTheme],

    getCurrentLightThemeColor: (state): string =>
      state.lightThemeColors[state.currentTheme],

    getCurrentExtraLightThemeColor: (state): string =>
      state.extraLightThemeColors[state.currentTheme],

    getCurrentBadgeRingOption: (state): BadgeRingOption =>
      state.currentBadgeRingOption,

    // methods to get the color based on color name prop
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

    // get the current theme colors bos swadow variantions (with 40 opacity like #d0305040)
    getCurrentThemeBoxShadow: (state): string => {
      const color = state.themeColors[state.currentTheme];
      return `0 0 0 2px ${color}40`;
    },

    getCurrentLightThemeBoxShadow: (state): string => {
      const color = state.lightThemeColors[state.currentTheme];
      return `0 0 0 2px ${color}40`;
    },

    getCurrentExtraLightThemeBoxShadow: (state): string => {
      const color = state.extraLightThemeColors[state.currentTheme];
      return `0 0 0 2px ${color}40`;
    },

    // methods to get the color box shadow based on color name prop
    getThemeBoxShadow:
      (state) =>
        (themeName: ThemeName): string => {
          const color = state.themeColors[themeName];
          return `0 0 0 2px ${color}40`;
        },

    getLightThemeBoxShadow:
      (state) =>
        (themeName: ThemeName): string => {
          const color = state.lightThemeColors[themeName];
          return `0 0 0 2px ${color}40`;
        },

    getExtraLightThemeBoxShadow:
      (state) =>
        (themeName: ThemeName): string => {
          const color = state.extraLightThemeColors[themeName];
          return `0 0 0 2px ${color}40`;
        },
  },

  actions: {
    setTheme(newTheme: ThemeName): void {
      if (this.themes.includes(newTheme)) {
        this.currentTheme = newTheme;

        // import.meta.client
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

    setLightThemeOption(newLightThemeOption: LightThemeOptionName): void {
      if (this.lightThemeOptions.includes(newLightThemeOption)) {
        this.currentLightThemeOption = newLightThemeOption;

        if (process.client) {
          localStorage.setItem(
            "selected-light-theme-option",
            newLightThemeOption
          );
        }


      }


    },

    // ✅ Add action to set badge ring option
    setBadgeRingOption(newOption: BadgeRingOption): void {
      if (this.badgeRingOptions.includes(newOption)) {
        this.currentBadgeRingOption = newOption;

        if (process.client) {
          localStorage.setItem("selected-badge-ring-option", newOption);
        }
      }
    },

    initializeTheme(): void {
      // import.meta.client
      if (process.client) {
        const savedTheme = localStorage.getItem(
          "selected-theme"
        ) as ThemeName

        const savedLightThemeOption = localStorage.getItem(
          "selected-light-theme-option",
        ) as LightThemeOptionName

        const savedBadgeRingOption = localStorage.getItem(
          "selected-badge-ring-option"
        ) as BadgeRingOption;

        if (savedTheme && this.themes.includes(savedTheme)) {
          this.setTheme(savedTheme);
        } else {
          this.setTheme(this.currentTheme);
        }

        if (savedLightThemeOption && this.lightThemeOptions.includes(savedLightThemeOption)) {
          this.setLightThemeOption(savedLightThemeOption);
        } else {
          this.setLightThemeOption(this.currentLightThemeOption);
        }

        if (savedBadgeRingOption && this.badgeRingOptions.includes(savedBadgeRingOption)) {
          this.setBadgeRingOption(savedBadgeRingOption);
        } else {
          this.setBadgeRingOption(this.currentBadgeRingOption);
        }
      }
    },
  },
});

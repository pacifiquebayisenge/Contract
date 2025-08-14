// composables/useTheme.js
export const useTheme = () => {
  const themes = ['sage-green', 'dark-blue', 'light-pink'];
  const theme = useState('theme', () => themes[0]); // Initialize with default theme
  const themeColors = {
    'sage-green': '#8A9A86',
    'dark-blue': '#1E3A8A',
    'light-pink': '#F9A8D4',
  };

  const setTheme = (newTheme: string) => {
    if (themes.includes(newTheme)) {
      theme.value = newTheme;
      if (process.client) {
        document.documentElement.setAttribute('data-theme', newTheme); // Apply to DOM
      }
    }
  };

  return { theme, themes, setTheme, themeColors };
};
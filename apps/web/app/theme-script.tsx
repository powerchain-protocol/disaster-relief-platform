export function ThemeScript() {
  const code = `
    (() => {
      try {
        const saved = localStorage.getItem("powerchain-theme");
        const theme = saved === "dark" ? "dark" : "light";
        document.documentElement.dataset.theme = theme;
        document.documentElement.style.colorScheme = theme;
      } catch {
        document.documentElement.dataset.theme = "light";
        document.documentElement.style.colorScheme = "light";
      }
    })();
  `;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}

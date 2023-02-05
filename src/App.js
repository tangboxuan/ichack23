import { createTheme, ThemeProvider } from "@mui/material";
import "./App.css";
import Home from "./Home";

const THEME = createTheme({
  typography: {
    fontFamily: "BlinkMacSystemFont",
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
  },
});

function App() {
  return (
    <ThemeProvider theme={THEME}>
      <Home />
    </ThemeProvider>
  );
}

export default App;

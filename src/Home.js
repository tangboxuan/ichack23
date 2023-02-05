import {
  Grid,
  Box,
  TextField,
  Typography,
  Chip,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useEffect, useRef, useState } from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import bytedance from "./images/bytedance.png";
import shein from "./images/shein.png";
import relianceindustries from "./images/relianceindustries.jpeg";
import logo from "./images/logo.jpg";
import environment from "./images/environment.png";
import social from "./images/social.png";
import governance from "./images/governance.jpeg";
import { ClipLoader } from "react-spinners";

const companies = [
  {
    name: "bytedance",
    scores: [78.6, 92.7, 95.5],
    data: ["UNLISTED", "FOUNDED 2012", "$9.4B FUNDING"],
    logo: bytedance,
  },
  {
    name: "shein",
    scores: [50.6, 70.7, 89.5],
    data: ["UNLISTED", "FOUNDED 2008", "$2.1B FUNDING"],
    logo: shein,
  },
  {
    name: "reliance industries",
    scores: [99.6, 89.1, 95.5],
    data: ["LISTED", "$194B MARKET CAP", "P/E RATIO 26.7"],
    logo: relianceindustries,
  },
];

function Company({ name }) {
  const company = companies.find((x) => x.name === name);
  const colors = ["#39a845", "#ffa500", "#0096ff"];
  const labels = ["Environment", "Social", "Governance"];
  const icons = [environment, social, governance];

  useEffect(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }, [name]);

  return company ? (
    <Grid direction="column" justifyContent="center" width="100vw">
      <Grid
        container
        justifyContent="space-evenly"
        style={{ minHeight: "20em" }}
      >
        {company.scores.map((score, index) => (
          <Grid style={{ width: "20em", textAlign: "center" }}>
            <Grid container direction="column">
              <div style={{ width: "90%" }}>
                <CircularProgressbar
                  value={score}
                  text={`${score}%`}
                  styles={{
                    root: {},
                    path: {
                      // Path color
                      stroke: colors[index],
                      transition: "stroke-dashoffset 0.5s ease 0s",
                    },
                    trail: {
                      // Trail color
                      stroke: "#dfe5e8",
                      // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
                      strokeLinecap: "butt",
                      // Rotate the trail
                      transform: "rotate(1turn)",
                      transformOrigin: "center center",
                    },
                    text: {
                      // Text color
                      fill: "#777",
                      // Text size
                      fontSize: "15px",
                    },
                  }}
                />
              </div>
              <Box marginTop="30px"></Box>
              <Grid
                container
                justifyContent="center"
                alignItems="center"
                direction="row"
                spacing={2}
              >
                <Grid item>
                  <Typography fontSize="1.5em" styles={{ marginTop: "10px" }}>
                    {labels[index]}
                  </Typography>
                </Grid>
                <Grid item>
                  <img src={icons[index]} alt={labels[index]} width="35px" />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        ))}
      </Grid>
      <Grid textAlign="center">
        <Grid item container direction="column">
          <Grid item style={{ margin: "10px 0px" }}>
            <img src={company.logo} alt="asd" height="180px" />
          </Grid>
          <Grid item>
            {company.data.map((label) => (
              <Chip
                label={`• ${label}`}
                color="error"
                style={{ margin: "10px" }}
              />
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  ) : null;
}

function Home() {
  const ref = useRef(null);
  const [isSearched, setSearched] = useState(false);
  const [input, setInput] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const clickHandler = async () => {
    setSearched(true);
    const company = companies.find((x) => x.name === input);
    if (!company) {
      return;
    }
    setLoading(true);
    setLoadingText("Fetching news articles from NewsAPI...");
    await new Promise((r) => setTimeout(r, 1000));
    setLoadingText("Translating articles using AWS Translate...");
    await new Promise((r) => setTimeout(r, 2000));
    setLoadingText("Conducting ESG sentimental analysis...");
    await new Promise((r) => setTimeout(r, 1000));
    setLoadingText("Any moment now...");
    await new Promise((r) => setTimeout(r, 500));
    setLoading(false);
    setCompanyName(company.name);
  };

  return (
    <Grid container direction="column" marginBottom="3em">
      <Grid
        item
        container
        style={{ height: "40vh" }}
        alignItems="end"
        justifyContent="center"
      >
        <img src={logo} alt="logo" height="180px" />
      </Grid>

      <Grid
        item
        container
        alignItems="center"
        justifyContent="center"
        style={{ height: "10vh", margin: "2em" }}
      >
        <TextField
          id="companyName"
          type="text"
          style={{ minWidth: "60vh", margin: "1em" }}
          label="Company"
          onChange={(e) => {
            setInput(e.target.value.toLowerCase());
          }}
        />
        <IconButton onClick={clickHandler}>
          <SearchIcon fontSize="large" />
        </IconButton>
      </Grid>
      {!isSearched || isLoading || (
        <Grid container>
          <Company ref={ref} name={companyName} />
        </Grid>
      )}
      {isLoading && (
        <Grid
          item
          container
          justifyContent="center"
          direction="column"
          spacing={2}
        >
          <Grid item textAlign="center">
            <ClipLoader loading={isLoading} />
          </Grid>
          <Grid item textAlign="center">
            <Typography>{loadingText}</Typography>
          </Grid>
        </Grid>
      )}
      <div ref={ref} />
    </Grid>
  );
}

export default Home;

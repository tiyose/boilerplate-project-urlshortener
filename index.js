require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

// parse form data
app.use(express.urlencoded({ extended: false }));
// parse json
app.use(express.json());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

/* ***************************
 * project-solution-code *****
 *****************************/
const urls = require("./data");
const dns = require("dns");
const { URL } = require("url");
const validUrl = require("valid-url");

function isValidUrl(urlToValidate) {
  try {
    const url = new URL(urlToValidate);
    const valid = dns.lookup(url.hostname, async (error) => {
      if (error) {
        return false;
      } else {
        return true;
      }
    });
    return valid;
  } catch (error) {
    return false;
  }
}

app.post("/api/shorturl", (req, res) => {
  const { url: original_url } = req.body;

  // if (isValidUrl(original_url) === false) {
  //   return res.status(400).json({
  //     error: "Invalid URL",
  //   });
  // } else {
  //   const short_url = (urls.length + 1).toString();
  //   const newLookup = { original_url, short_url };
  //   urls.push(newLookup);
  //   return res.status(201).json({ success: true, data: newLookup });
  // }

  try {
    const url = new URL(original_url);
    dns.lookup(url.hostname, async (error) => {
      if (error) {
        return res.json({
          error: "invalid url",
        });
      } else {
        const lookup = urls.find(
          (element) => element["original_url"] === original_url
        );
        if (lookup) {
          return res.status(201).send(lookup);
        } else {
          const short_url = (urls.length + 1).toString();
          const newLookup = { original_url, short_url };
          urls.push(newLookup);
          return res.status(201).send(newLookup);
        }
      }
    });
  } catch (error) {
    return res.json({
      error: "invalid url",
    });
  }
});

app.get("/api/shorturl/:url", (req, res) => {
  try {
    const { url } = req.params;
    const lookup = urls.find((element) => element["short_url"] === url);
    const original_url = lookup["original_url"];
    return res.redirect(original_url);
  } catch (error) {}
  return res.status(404).json({ msg: "Not found." });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

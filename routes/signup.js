var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  const navbarData = [
    { name: "Feed", link: "/post" },
    { name: "Create Post", link: "/create-post" },
  ];

  const errorMessage = req.query.error;

  console.log("errorMessage", errorMessage);
  res.render("signup", {
    title: "Express",
    error: errorMessage,
    global: {
      navbar: navbarData,
    },
  });
});

module.exports = router;

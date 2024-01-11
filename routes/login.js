var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  const navbarData = [
    { name: "Feed", link: "/post" },
    { name: "Create Post", link: "/create-post" },
  ];
  res.render("login", {
    title: "Express",
    global: {
      navbar: navbarData,
    },
  });
});

module.exports = router;

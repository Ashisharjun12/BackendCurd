const express = require("express");
const app = express();
const UserModal = require("./models/User.js");
const PostModel = require("./models/post.js");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require('path');
const upload = require("./utils/multer.js");


app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")))
app.use(cookieParser());

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/register", async (req, res) => {
  const { username, name, email, password, age } = req.body;

  let user = await UserModal.findOne({ email });
  if (user) res.status(500).send("user exist already");

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      const user = await UserModal.create({
        username,
        name,
        age,
        email,
        password: hash,
        post: [],
      });

      const token = jwt.sign({ email, userId: user._id }, "secret");
      res.cookie("token", token);
      res.redirect("/login");
    });
  });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  let user = await UserModal.findOne({ email });
  if (!user) res.status(500).send("Somethinng went wrong");

  bcrypt.compare(password, user.password, function (err, result) {
    if (result) {
      //jwt signin
      const token = jwt.sign({ email, userId: user._id }, "secret");
      res.cookie("token", token);

      res.status(200).redirect("/profile");
    } else res.redirect("/login");
  });
});

app.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/login");
});

app.get("/profile", isLoggedIn, async (req, res) => {
  const user = await UserModal.findOne({ email: req.user.email }).populate(
    "post"
  );
  console.log(user);

  res.render("profile", { user });
});

app.get("/like/:id", isLoggedIn, async (req, res) => {
  const post = await PostModel.findOne({ _id: req.params.id }).populate("user");
  console.log(req.user); // come from isloggedIn Token and middleware you can also use data = req.user

  //add and remove likes
  if (post.likes.indexOf(req.user.userId)) {
    post.likes.push(req.user.userId);
  } else {
    post.likes.splice(post.likes.indexOf(req.user.userId), 1);
  }

  await post.save();

  res.redirect("/profile");
});

app.get("/edit/:id", isLoggedIn, async (req, res) => {
  const post = await PostModel.findOne({ _id: req.params.id }).populate("user");

  res.render("edit", { post });
});

app.post("/update/:id", isLoggedIn, async (req, res) => {
  const post = await PostModel.findOneAndUpdate(
    { _id: req.params.id },
    { content: req.body.content }
  );

  res.redirect("/profile");
});

app.post("/post", isLoggedIn, async (req, res) => {
  const user = await UserModal.findOne({ email: req.user.email });
  let { content } = req.body;
  let post = await PostModel.create({
    user: user._id,
    content,
  });

  user.post.push(post._id);
  await user.save();
  res.redirect("/profile");
});


app.get("/profile/upload" , (req,res)=>{
  res.render("profileUpload")
})

app.post("/upload", isLoggedIn ,upload.single("image") ,async (req,res)=>{

  const user = await UserModal.findOne({email :req.user.email})
  user.profile = req.file.filename

   await user.save()

   res.redirect("/profile")

  console.log(req.file)


})

//middlawares

function isLoggedIn(req, res, next) {
  if (req.cookies.token == "") res.send("you must be loggedIn");
  else {
    const data = jwt.verify(req.cookies.token, "secret");
    req.user = data;
  }
  next();
}

app.listen(3000, function () {
  console.log(`server is running at : ${3000}`);
});

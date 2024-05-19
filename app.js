const express = require("express");
const app = express();
const UserModal = require("./models/User.js");
const PostModel = require("./models/post.js");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
      const UserCreate = await UserModal.create({
        username,
        name,
        age,
        email,
        password: hash,
      });

      const token = jwt.sign({ email, userId: UserCreate._id }, "secret");
      res.cookie("token", token);
      res.send("registerd user!!");
    });
  });
});


app.post("/login", async (req, res) => {
  const {  email, password} = req.body;

  let user = await UserModal.findOne({ email });
  if (!user) res.status(500).send("Somethinng went wrong");

  bcrypt.compare(password ,user.password ,function(err ,result){
    if(result) {
         //jwt signin
         const token = jwt.sign({ email, userId: user._id }, "secret");
         res.cookie("token", token);

        res.status(200).send('you can login')

       
    }
         else res.redirect('/login')
  })

});


app.get("/logout", (req, res) => {
    res.cookie("token" ,"")
    res.redirect("/login");
  });

  app.get('/profile' , isLoggedIn,(req,res)=>{

    res.render('profile')
    console.log(req.user)

  })



  //middlawares 

  function isLoggedIn (req,res ,next){
    if(req.cookies.token == "") res.send('you must be loggedIn')

        else{
          const data =  jwt.verify(req.cookies.token , "secret");
          req.user = data
        }
        next();
  }



app.listen(3000, function () {
  console.log(`server is running at : ${3000}`);
});

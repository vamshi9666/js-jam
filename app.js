var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const PrismaClient = require("@prisma/client").PrismaClient
const bcrypt = require("bcryptjs")
const session = require("express-session")
const loginRouter  = require("./routes/login")

var app = express();
// const hbs = require("handlebars");
// const helpers = require('handlebars-helpers');

// const halpers = require("handlebars-helpers")(['array', 'comparison', 'date', 'html', 'math', 'misc', 'number', 'object', 'regex', 'string', 'url']);


// hbs.registerHelper("include",helpers.)

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


const client  = new PrismaClient()

client.post.findMany().then((data)=>{
  console.log(data)
}).catch((err)=>{
  console.log(err)
})



app.use(session({
  secret:"my secret",
  saveUninitialized: false, 
  resave: false,
  cookie:{
    maxAge: 60000
  }
}))



const authGaurd = (req,res,next)=>{
  if (res?.session?.user){
    next()

  }
  else {
    res.redirect("/login")
  }
}



app.post("/login",async  (req, res)=>{
  const {email, password} = req.body

  const user = await client.user.findUnique({
    where:{
      email: email 
    }
  })
  console.log('user', user);
  if (!user){
    return res.redirect(301,"/login?error=User not found")
    // return res.status(404).json({message:"User not found"})
  }
  const passwordMatch = bcrypt.compareSync(password, user.password)

  if (passwordMatch){

    console.log("password match",user);
    req.session.user = user
    req.session.save()
    res.redirect("/profile")
  } else {
    res.redirect("/login?error=Invalid password")
  }
  // console.log(req.body);

})


app.post('/signup', async (req, res) => {
  const { email, password, username } = req.body;

  console.log("req.body", req.body);
  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync(password, salt);

  const user = await client.user.create({
    data: {
      email: email,
        password: hash,
        name: username,
    },
  }).catch((err)=>{
    console.log(err)
  })
  console.log("user", user);
  res.redirect("/login");
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/login', loginRouter);
app.use('/signup', require("./routes/signup"));

app.get("/profile", authGaurd, (req,res)=>{
  res.render("profile", {title:"Profile"})
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

const path = require('path');
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/user')

const app = express();
var cors = require('cors')

app.use(cors())

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findByPk("bgjiiojhg468fft455")
    .then(user => {
      req.user = new User(user.name, user.email,user.cart,user._id);
      next();
    })
    .catch(err => console.log(err));
  next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use((req, res)=>{
    res.sendFile(path.join(__dirname,`${req.url}`));
})
app.use(errorController.get404);
mongoConnect(() => {
  app.listen(3000);
})

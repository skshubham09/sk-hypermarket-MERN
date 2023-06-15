const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config()
const Stripe = require('stripe')

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT || 4000
//mongodb

mongoose.set('strictQuery', false)
mongoose.connect(process.env.MONGODB_URL).then(() => console.log('mongodb connected')).catch((err) => console.log(err))

//schema
const userSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  email: {
    type: String,
    unique: true
  },
  password: String,
  confirmPassword: String,
  image: String
});

//models
const userModel = mongoose.model("user", userSchema);

//api
app.get("/", (req, res) => {
  res.send("server ok")
})

//signup
app.post("/signup", async (req, res) => {
  //console.log(req.body)
  const { email } = req.body;

  try {
    const result = await userModel.findOne({ email: email });

    if (result) {
      res.send({ message: "Email id is already registered", alert: false });
    } else {
      const data = new userModel(req.body);
      await data.save();
      res.send({ message: "Successfully sign up", alert: true });
    }
  } catch (err) {
    console.log(err);
    // Handle the error appropriately (e.g., send an error response)
  }


});

//login
app.post('/login', async (req, res) => {
  //console.log(req.body)
  const { email } = req.body;
  try {
    const result = await userModel.findOne({ email: email });
    if (result) {
      const dataSend = {
        _id: result._id,
        firstName:
          result.firstName,
        lastName: result.lastName,
        email: result.email,
        image: result.image
      }
      //console.log(dataSend);
      res.send({ message: "Successfully login", alert: true, data: dataSend });

    } else {
      res.send({ message: "email not found", alert: false })
    }
  } catch (err) {
    console.log(err);
  }

})

//product section

const schemaProduct = mongoose.Schema({
  name: String,
  category: String,
  image: String,
  price: String,
  description: String,
});
const productModel = mongoose.model("product", schemaProduct)



//save product in data 
//api
app.post("/uploadProduct", async (req, res) => {
  try {
    const prodData = new productModel(req.body);
    await prodData.save();
    //console.log("Product saved successfully");
    res.send({ message: "Upload successfully" });
  } catch (error) {
    console.error("Failed to save product:", error);
    res.status(500).send({ error: "Failed to save product" });
  }
});

//product

app.get("/product", async (req, res) => {
  const data = await productModel.find({})
  res.send(JSON.stringify(data));
})

//payment method
//console.log(process.env.STRIPE_SECRET_KEY)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

app.post("/create-checkout-session", async (req, res) => {

  try {
    const params = {
      submit_type: 'pay',
      mode: "payment",
      payment_method_types: ['card'],
      billing_address_collection: "auto",
      shipping_options: [{ shipping_rate: "shr_1NJAkMSHEDjKvMNBUSGgM9Le" }],

      line_items: req.body.map((item) => {
        return {
          price_data: {
            currency: "inr",
            product_data: {
              name: item.name,
              //image: [item.image]
            },
            unit_amount: item.price * 100
          },
          adjustable_quantity: {
            enabled: true,
            minimum: 1
          },
          quantity: item.qty
        }
      }),
      success_url : `${process.env.FRONTEND_URL}/success`,
          cancel_url : `${process.env.FRONTEND_URL}/cancel`,
    }

    const session = await stripe.checkout.sessions.create(params)
    res.status(200).json(session.id)

  } catch (err) {
    res.status(res.statusCode || 500).json(err.message)
  }

})

//server is running
app.listen(PORT, () => console.log("Server is running at " + PORT));

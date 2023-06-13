const express= require('express');
const cors=require('cors');
const mongoose=require('mongoose');
const dotenv=require('dotenv').config()
const app=express();
app.use(cors());
app.use(express.json({limit: "10mb"}));

const PORT =process.env.PORT || 4000
//mongodb

mongoose.set('strictQuery',false)
mongoose.connect(process.env.MONGODB_URL).then(()=>console.log('mongodb connected')).catch((err)=>console.log(err))

//schema
const userSchema=mongoose.Schema({
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
app.get("/",(req,res)=>{
    res.send("server ok")
})

//signup
app.post("/signup",async(req,res)=>{
    console.log(req.body)
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
  app.post('/login',async(req, res) => {
    console.log(req.body)
    const {email}=req.body;
    try{
        const result = await userModel.findOne({ email: email });
        if (result){
            const dataSend={
                _id: result._id,
  firstName:
 result.firstName,      
  lastName: result.lastName,    
  email: result.email,   
  image:result.image
            }
            console.log(dataSend);
            res.send({ message: "Successfully login", alert: true, data: dataSend });
        
    }else{
res.send({ message:"email not found", alert: false})
    }
}catch (err) {
        console.log(err);
      }

})

//product section

const schemaProduct = mongoose.Schema({
  name: String,
  category:String,
  image: String,
  price: String,
  description: String,
});
const productModel = mongoose.model("product",schemaProduct)



//save product in data 
//api
app.post("/uploadProduct", async (req, res) => {
  try {
    const prodData = new productModel(req.body);
    await prodData.save();
    console.log("Product saved successfully");
    res.send({ message: "Upload successfully" });
  } catch (error) {
    console.error("Failed to save product:", error);
    res.status(500).send({ error: "Failed to save product" });
  }
});

//product

app.get("/product", async (req, res) => {
  const data =await productModel.find({})
  res.send(JSON.stringify(data));
})


//server is running
app.listen(PORT,()=>console.log("Server is running at " +PORT));
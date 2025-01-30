const express = require("express");

const app = express();

app.use("/test", (req,res)=>{
    res.send("Hi this is your server")
})

app.listen("3000",()=>{
    console.log("Server is listening at port 3000")
})
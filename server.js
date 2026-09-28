import app from "./src/app.js";
import connectDB from "./src/database/database.js";



app.listen(3000, ()=>{
  console.log("Server started on port 3000.");
});
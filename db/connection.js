const mongoose = require("mongoose");
 require("dotenv").config();
mongoose
  .connect(process.env.MONGODB_URI   , {
    dbName: process.env.DB_NAME,
  ssl: true,
  tls: true,
  // tlsInsecure: true, // Bypass certificate validation (useful for testing)
  tlsAllowInvalidCertificates: true // Allow invalid certificates (useful for testing)
  })
  .then(() => {
    console.log(`database connected succesfully`);
  })
  .catch((err) => {
    console.log(err);
    //  mongoose.disconnect();
  });

// const mongoose = require('mongoose');
// const uri = process.env.MONGODB_URI;
// const clientOptions = { ssl: true,
//   tls: true,
//   // tlsInsecure: true, // Bypass certificate validation (useful for testing)
//   tlsAllowInvalidCertificates: true, // Allow invalid certificates (useful for testing)
//   // serverApi: { version: '1', strict: true, deprecationErrors: true } };
// }
// async function run() {
//   try {
//     // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
//     await mongoose.connect(uri, clientOptions);
//     await mongoose.connection.db.admin().command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await mongoose.disconnect();
//   }
// }
// run().catch(console.dir);
const mongoose = require("mongoose");
const debug = require("debug");
mongoose.set("strictQuery", true);

const URI = process.env.URI;
const connectDB = async () => {
  try {
    await mongoose.connect(URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const con = mongoose.connection;
    console.log(`mongodb connected at port ${con.port}`);

    con.on("connected", () => {
      debug("mongodb connected");
    });
    con.on("error", (err) => {
      debug(`connection error ${err}`);
    });
    con.on("disconnected", () => {
      debug("mongodb disconnected");
    });
    return con;
  } catch (error) {
    console.log(error);
    debug({ message: error.message });
  }
};

function getDb() {
  return mongoose.connection;
}
module.exports = { getDb, connectDB };

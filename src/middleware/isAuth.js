// const jwt = require("jsonwebtoken");
// async function authenticate(req, res, next) {
//   const token = req.cookies.token;
//   console.log("token:", token);
//   try {
//     if (!token) {
//       return res
//         .status(401)
//         .send({ error: "No token provided. Unthauthorized access" });
//     } else {
//       const decoded = await jwt.verify(token, process.env.SECRET_KEY);
//       req.studentId = decoded._id;
//       console.log({ student: req.studentId });
//       next();
//     }
//   } catch (error) {
//     // res.clearCookie("token");
//     return res.status(401).send({ error: "Unauthorized access" });
//   }
// }

// module.exports = authenticate;
const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log("Token: ", token);
  try {
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.studentId = decoded._id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = authenticate;

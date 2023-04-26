const Student = require("../model/student");
require("../db/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Token = require("../model/token");
const refeshToken = require("../utils/verificationToken");
// const NepaliDate = require("nepali-date-converter");
const haversineDistanceBetweenPoints = require("../utils/haversineDistance");

exports.register = async (req, res) => {
  const {
    fname,
    lname,
    dob,
    gender,
    mobileNumber,
    address,
    email,
    password,
    cpassword,
    fatherName,
    motherName,
    guardianNumber,
    passedYear1,
    passedYear2,
    marks1,
    marks2,
  } = req.body;

  if (
    !fname ||
    !lname ||
    !dob ||
    !gender ||
    !mobileNumber ||
    !address ||
    !email ||
    !password ||
    !cpassword ||
    !fatherName ||
    !motherName ||
    !guardianNumber ||
    !passedYear1 ||
    !passedYear2 ||
    !marks1 ||
    !marks2
  ) {
    return res
      .status(422)
      .send({ error: "Please fill all the required fields" });
  }

  if (password != cpassword) {
    return res.status(422).send({ error: "Both password must be same!!" });
  }
  try {
    const studentExist = await Student.findOne({
      $or: [{ email: email }, { mobileNumber: mobileNumber }],
    });
    if (studentExist) {
      return res
        .status(422)
        .send({ error: "Email or phone number already exists!!" });
    }
    const newStudent = new Student({
      fname,
      lname,
      dob,
      gender,
      mobileNumber,
      address,
      email,
      password,
      cpassword,
      fatherName,
      motherName,
      guardianNumber,
      passedYear1,
      passedYear2,
      marks1,
      marks2,
    });
    await newStudent.save();
    await refeshToken(newStudent._id, newStudent.email);
    return res.status(201).send({
      message: "Email verification mail sent. Please check you inbox",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Failed to register. Try again!!!" });
  }
};

exports.verify = async (req, res) => {
  try {
    const token = await Token.findOne({ token: req.params.token });
    if (!token) {
      return res.send({ message: "Invalid link!!" });
    }
    const decoded = jwt.verify(req.params.token, process.env.EMAIL_SECRET);
    console.log(decoded);
    const isEqual = token.id.equals(decoded._id);
    console.log(isEqual);
    if (!isEqual) {
      return res.status(400).send({ message: "Invalid link!!" });
    } else {
      await Student.findOneAndUpdate(
        { _id: decoded._id },
        { $set: { verified: true } }
      );
      await Token.findByIdAndRemove(token._id);
      return res.redirect("http://localhost:5173/login");
    }
  } catch (error) {
    console.log(error);
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(403).send({ message: "Email or password missing" });
    }
    const studentExist = await Student.findOne({ email: email });
    if (!studentExist) {
      return res.status(403).send({ message: "Invalid Credentials" });
    }
    console.log(studentExist._id);
    const accessToken = await Token.findOne({ id: studentExist._id });
    if (!studentExist.verified && !accessToken) {
      await refeshToken(studentExist._id, studentExist.email);
      return res.status(201).send({
        message:
          "Email verification mail has been sent. Please check you inbox",
      });
    } else if (!studentExist.verified && accessToken) {
      return res.status(201).send({
        message: "Please verify your email account first!! Check your inbox",
      });
    }
    const isMatch = await bcrypt.compare(password, studentExist.password);
    if (isMatch === false) {
      return res.status(403).send({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ _id: studentExist._id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });
    // res.cookie("token", token, {
    //   httpOnly: true,
    // });
    // console.log("cookie saved successfully");
    return res.status(200).send({ message: "Welcome", token: token });
    // return res.status(200).send({ message: "Welcome" });
  } catch (error) {
    console.log(error.message);
  }
};

exports.attendance = async (req, res) => {
  const { latitude, longitude, scannedData } = req.body;
  console.log(latitude);
  console.log(longitude);

  // const collegeCoordinates = {
  //   latitude: 26.8298851,
  //   longitude: 87.2916616,
  // };
  const collegeCoordinates = {
    latitude: 27.7,
    longitude: 85.3332,
  };

  const currentTime = new Date().getHours();
  // if (currentTime < 6 || currentTime > 10) {
  //   return res
  //     .status(403)
  //     .send({ error: "Attendance can only mark between 6 AM to 10 AM" });
  // }
  const distance = haversineDistanceBetweenPoints(
    collegeCoordinates.latitude,
    collegeCoordinates.longitude,
    latitude,
    longitude
  );
  console.log(distance);

  if (distance > 100) {
    return res
      .status(403)
      .send({ error: "Cannot mark attendance. You are not in college" });
  } else {
    try {
      const studentExist = await Student.findOne({ studentId: scannedData });
      if (!studentExist) {
        return res.status(401).send({ error: "Invalid QR code" });
      }
      if (!studentExist.attendance) {
        studentExist.attendance = new Map();
      }
      const date = new Date();
      const currentTime = date.toLocaleTimeString("en-US", { hour12: true });
      const currentDate = date.toLocaleString("en-us", {
        hour12: true,
        weekday: "long",
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      // const currentDate = new NepaliDate().format("ddd, YYYY - MM - DD");
      console.log(currentDate);
      if (studentExist.attendance.has(currentDate)) {
        return res
          .status(503)
          .send({ message: "Attendance is already recorded for today!!" });
      } else {
        studentExist.attendance.set(currentDate, {
          status: true,
          time: currentTime,
        });
        await studentExist.save();
        return res
          .status(200)
          .send({
            message: "Your attendance is recorded successfully.Thank you!!",
          });
      }
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .send({ error: "Internal Server Error. Try again!!" });
    }
  }
};

// exports.change_password = async (req, res) => {
//   const { currentPassword, newPassword, confirmPassword } = req.body;
//   // const id = req.studentId;
//   const currentUser = await Student.findOne({ _id: id });
//   try {
//     if (newPassword != confirmPassword) {
//       return res
//         .status(400)
//         .send({ message: "New password and confirmed password don't match" });
//     }
//     const isMatch = await bcrypt.compare(currentPassword, currentUser.password);
//     if (!isMatch) {
//       console.log(isMatch);
//       return res.status(400).send({ message: "Incorrect current password." });
//     } else {
//       if (await bcrypt.compare(newPassword, currentUser.password)) {
//         return res
//           .status(402)
//           .send({ message: "new password and current password matched!" });
//       }
//       (currentUser.password = newPassword),
//         (currentUser.cpassword = confirmPassword);
//       await currentUser.save();
//       return res.status(200).send({ message: "Password changed sucessfully" });
//     }
//   } catch (error) {
//     console.log(error);
//     return res
//       .status(422)
//       .send({ error: "failed to change password. Try again" });
//   }
// };
exports.change_password = async (req, res) => {
  const { email, currentPassword, newPassword, confirmPassword } = req.body;
  // const id = req.studentId;
  const currentUser = await Student.findOne({ email: email });
  if (!currentUser) {
    return res.status(403).send({ message: "Student does not exist" });
  }
  try {
    if (newPassword != confirmPassword) {
      return res
        .status(400)
        .send({ message: "New password and confirmed password don't match" });
    }
    const isMatch = await bcrypt.compare(currentPassword, currentUser.password);
    if (!isMatch) {
      console.log(isMatch);
      return res.status(400).send({ message: "Incorrect current password." });
    } else {
      if (await bcrypt.compare(newPassword, currentUser.password)) {
        return res
          .status(402)
          .send({ message: "new password and current password matched!" });
      }
      (currentUser.password = newPassword),
        (currentUser.cpassword = confirmPassword);
      await currentUser.save();
      return res.status(200).send({ message: "Password changed sucessfully" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(422)
      .send({ error: "failed to change password. Try again" });
  }
};

exports.change_email = async (req, res) => {
  const { oldEmail, newEmail, password } = req.body;
  const currentUser = await Student.findOne({ email: oldEmail });
  if (!currentUser) {
    return res.status(403).send({ message: "Student does not exist" });
  }
  try {
    const isMatch = await bcrypt.compare(password, currentUser.password);
    if (!isMatch) {
      console.log(isMatch);
      return res.status(400).send({ message: "Incorrect password" });
    } else {
      (currentUser.email = newEmail), await currentUser.save();
      return res.status(200).send({ message: "Email changed sucessfully" });
    }
  } catch (error) {
    console.log(error);
    return res.status(422).send({ error: "failed to change Email. Try again" });
  }
};

exports.authentication = async (req, res) => {
  console.log("Genuine user");
  const student = await Student.findOne(
    { _id: req.studentId },
    {
      password: 0,
      cpassword: 0,
      verified: 0,
      createdAt: 0,
      updatedAt: 0,
      attendance: 0,
    }
  );
  res.status(200).send(student);
};

// exports.logout = async (req, res) => {
//   res.clearCookie("token");
//   return res.send({ message: "Student logged out" });
// };

// exports.deleteStudent = async (req, res) => {
//   const studentId = req.params.id;
//   const studentExist = await Student.findOne({
//     studentId: studentId,
//   });
//   console.log(studentExist);
//   if (!studentExist) {
//     return res.send({ message: "Erorr!! Student not found" });
//   }
//   try {
//     const deleteStudent = await Student.deleteOne({ _id: studentExist._id });
//     if (deleteStudent) {
//       return res.send({ message: "Deleted Successfuly", data: deleteStudent });
//     } else {
//       return res.send({ message: "Error on delete" });
//     }
//   } catch (error) {
//     console.log(error.message);
//   }
// };

exports.getallStudent = async (req, res) => {
  Student.find(
    {},
    {
      password: 0,
      cpassword: 0,
      verified: 0,
      createdAt: 0,
      updatedAt: 0,
      attendance: 0,
    },
    function (err, students) {
      if (err) {
        console.log(err);
      } else {
        res.json(students);
      }
    }
  );
};

exports.getAttendance = async (req, res) => {
  const studentId = req.studentId;
  const studentData = await Student.findOne({ id: studentId });
  res.send({ data: studentData.attendance });
};

exports.getAttendanceValue = async (req, res) => {
  const { studentId } = req.body;
  // const studentId = req.studentId;
  const studentData = await Student.findOne({ studentId });
  console.log(studentData);
  if (studentData.attendance == null) {
    return res.send({ pcount: 0, acount: 0, total: pcount + acount });
  }

  let pcount = 0;
  let acount = 0;

  for (const attendance of studentData.attendance.values()) {
    if (attendance.status === true) {
      pcount++;
    } else {
      acount++;
    }
  }

  return res.send({ pcount, acount, total: pcount + acount });
};

exports.uploadPhoto = async (req, res) => {
  try {
    const studentId = req.params.id;
    console.log(req.params.id);
    const student = await Student.findOne({ studentId });
    console.log(student);

    if (!student) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    student.photo = req.file.filename;

    await student.save();
    console.log("Photo uploaded successfully");

    res.json({ message: "Photo uploaded successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPhoto = async (req, res) => {
  try {
    const studentId = req.params.id;
    console.log(req.params.id);
    const student = await Student.findOne({ studentId });

    if (!student) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!student.photo) {
      return res.status(404).json({ message: "Photo not found" });
    }

    res.sendFile(student.photo, { root: "./src/uploads" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
// const qr = require("qr-image");
const bcrypt = require("bcryptjs");
require("../db/database");
// const Counter = require("../model/counter");
const FeeStat = require("./feestat");

const studentSchema = new mongoose.Schema(
  {
    fname: {
      type: String,
      required: true,
    },
    lname: {
      type: String,
      required: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    address: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    cpassword: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
      required: true,
    },
    fatherName: {
      type: String,
      required: true,
    },
    motherName: {
      type: String,
      required: true,
    },
    guardianNumber: {
      type: Number,
      required: true,
    },
    passedYear1: {
      type: Number,
      required: true,
    },
    marks1: {
      type: Number,
      required: true,
    },
    passedYear2: {
      type: Number,
      required: true,
    },
    semester: {
      type: String,
      required: true,
      default: "first",
      values: [
        "first",
        "second",
        "third",
        "fourth",
        "fifth",
        "sixth",
        "seventh",
        "eighth",
      ],
    },
    marks2: {
      type: Number,
      required: true,
    },
    studentId: {
      type: String,
      unique: true,
    },
    attendance: {
      type: Map,
      of: {
        status: Boolean,
        time: String,
      },
    },
    photo: {
      type: String,
    },
  },
  { timestamps: true }
);

//encrypt user password
studentSchema.pre("save", async function (next) {
  const student = this;
  if (student.isModified("password")) {
    student.password = await bcrypt.hash(student.password, 12);
    student.cpassword = await bcrypt.hash(student.cpassword, 12);
  }
  next();
});

// studentSchema.methods.generateAuthToken = async function () {
//   const student = this
//   try {
//     let token = jwt.sign({ _id: student._id }, process.env.SECRET_KEY)
//     student.tokens = student.tokens.concat({ token: token })
//     await student.save()
//     console.log(token)
//     return token
//   } catch (error) {
//     console.log(error)
//   }
// }
studentSchema.pre("save", function (next) {
  const student = this;
  if (student.isNew) {
    const today = new Date();
    const year = today.getFullYear();
    student.studentId =
      "BMC-" +
      `${student.fname}` +
      `${student.lname}` +
      "-" +
      Math.floor(1000 + Math.random() * 9000) +
      "-" +
      `${year}`;
    next();
  } else {
    next();
  }
});
// generate a studentId
// studentSchema.pre("save", function (next) {
//   const student = this;
//   if (student.isNew) {
//     Counter.findByIdAndUpdate(
//       { _id: "studentId" },
//       { $inc: { seq: 1 } },
//       { new: true, upsert: true },
//       function (error, counter) {
//         if (error) return next(error);
//         if (!counter) {
//           return next(new Error("Counter not found."));
//         }
//         const today = new Date();
//         const year = today.getFullYear();
//         student.studentId =
//           "BMC-" +
//           `${student.fname}` +
//           `${student.lname}` +
//           "-" +
//           counter.seq +
//           -`${year}`;
//         next();
//       }
//     );
//   } else {
//     next();
//   }
// });

// studentSchema.pre('save', function(next) {
// const student = this;
// Counter.findByIdAndUpdate({_id: 'studentId'}, {$inc: { seq: 1}}, {new: true, upsert: true}, function(error, counter){
//   if(error)
//     return next(error);
//     const today = new NepaliDate();
//     const year = today.getYear();
//     student.studentId = 'BMC-'+`${student.fname}`+`${student.lname}` +'-'+ counter.seq + -`${year}`;
//     next();
//   });
// });

// generate qr code
// studentSchema.pre("save", function (next) {
//   const student = this;
//   if (student.isNew) {
//     const qrCodeData = `${student.studentId}`;
//     const qrCodeBuffer = qr.imageSync(qrCodeData, { type: "png" });
//     student.qrCode = qrCodeBuffer;
//     next();
//   } else {
//     next();
//   }
// });

//generate fee stat
studentSchema.pre("save", async function (next) {
  const student = this;
  if (student.isNew) {
    const feestat = new FeeStat({
      id: student._id,
      studentId: student.studentId,
    });
    await feestat.save();
    console.log(feestat);
    next();
  }
});

const Student = mongoose.model("Student", studentSchema);
module.exports = Student;

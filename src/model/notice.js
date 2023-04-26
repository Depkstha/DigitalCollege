const mongoose = require("mongoose");
const sendMail = require("../utils/sendnotice");

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    photo: {
      type: String,
    },
    noticetype: {
      type: String,
    },
    semester: {
      type: String,
    },
  },
  { timestamps: true }
);
noticeSchema.pre("save", async function (next) {
  const notice = this;
  if (notice.noticetype == "Exam form") {
    Student.find({ semester: notice.semester }, function (err, students) {
      if (err) {
        console.log(err);
      } else {
        for (const student of students) {
          FeeStat.find({ studentId: student.studentId });
          sendMail(student.email);
        }
      }
    });
  }
  next();
});
const Notice = mongoose.model("Notice", noticeSchema);
module.exports = Notice;

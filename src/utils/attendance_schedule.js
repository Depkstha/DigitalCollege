// const cron = require("node-cron");
// const Student =require("../model/Student");

// cron.schedule("0 11 * * *", async () => {
//   let student = await Student.find({},(students,error)=>{
//     students.forEach(student){
//       if(!student.attendance.has(currentDate)){
//         studentExist.attendance.set(currentDate, {
//           status: false,
//           time: null,
//         });
//         await student.save();
//       }}})
//       cron.start();
//     })
const cron = require("node-cron");
const Student = require("../model/student");

const task = cron.schedule("13 11 * * *", async () => {
  console.log("runn successfully");
  const date = new Date();
  const currentDate = date.toLocaleString("en-us", {
    hour12: true,
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const students = await Student.find({});

  for (const student of students) {
    if (!student.attendance) {
      student.attendance = new Map();
    }
    if (student.attendance.has(currentDate)) {
      console.log("already attendance");
    } else {
      student.attendance.set(currentDate, {
        status: false,
        time: "null",
      });
      console.log("run successfully");
      await student.save();
    }
  }
});
module.exports = task;

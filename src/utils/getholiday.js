const cron = require("node-cron");
const Student = require("../model/student");

const task1 = cron.schedule("17 11 * * *", async () => {
  console.log("run successfully");

  const studentId = "BMC-DeepakShrestha-1-2023";
  const studentData = await Student.findOne({ studentId });
  console.log(studentData);

  let pcount = 0;
  let acount = 0;

  for (const attendance of studentData.attendance.values()) {
    if (attendance.status === true) {
      pcount++;
    } else {
      acount++;
    }
  }

  res.send({ pcount, acount, total: pcount + acount });
});

module.exports = task1;

const clientModel = require("../models/clientModel");
const expensesModel = require("../models/expensesModel");
const express = require("express");
const memberModel = require("../models/memberModel");
const projectdetailsModel = require("../models/projectdetailsModel");
const hoursModel = require("../models/hoursModel");
const router = express.Router();

router.get("/V1/getAllExpenses", async (req, res) => {
  try {
    const expenses = await expensesModel.find({ isDeleted: false });
    res.status(200).send(expenses);
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
});


router.post("/V1/expensesdata", async (req, res) => {
  try {
    const { expenseName, addAmount, selectDate, byWhom, addReason } = req.body;
    if (!expenseName || !addAmount || !selectDate || !byWhom || !addReason)
      return res
        .status(400)
        .send({ status: false, message: "All fields are required" });
    const expensesData = new expensesModel(req.body);
    await expensesData.save();
    return res.status(201).send(expensesData);
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

// This api calcultae amonth month and year  wise

router.get("/V1/monthlyProfitSummary", async (req, res) => {
  try {
    let query = req.query;
    // console.log("qu",query)
    if (query.from && query.to) {
      let fromDate = new Date(
        String(query.from).split("-").join("-")
      );

      fromDate.setUTCHours(0, 0, 0, 0);

      let toDate = new Date(String(query.to).split("-").join("-"));

      toDate.setUTCHours(23, 59, 59, 999);

      const formattedFromDate = fromDate.toISOString().split("T")[0];
        const formattedToDate = toDate.toISOString().split("T")[0];
console.log("foe",formattedFromDate,formattedToDate)
if(fromDate>toDate){
  return res.status(400).json({"Message":"Invalid date range."})
}
    const projects = await projectdetailsModel.find({ isDeleted: false });
    const hours = await hoursModel.find({ isDeleted: false });
    const expenses = await expensesModel.find({  isDeleted: false,
      selectDate: {
        $gte: formattedFromDate,
        $lte: formattedToDate,
      }, });

    let totalSellingPrice = 0;
    let totalCollectionDue = 0;
    let totalCost = 0;
    let totalExpenses = 0;

    // Calculate total selling price and collection due from projects
    projects.forEach((project) => {
      totalSellingPrice += project.sellingPrice;
      totalCollectionDue += project.collectiondue;   //Overall due this month
    });

    // Calculate total cost from hours
    hours.forEach((hour) => {
      totalCost += hour.costhour;
    });

    // Calculate total expenses
    expenses.forEach((expense) => {
      totalExpenses += expense.addAmount; //Amount spent this month
    });

    // Calculate total profit
    const totalProfit = Math.abs(totalSellingPrice - (totalCost + totalExpenses)); //Total profits this month

    return res.status(200).send({
      status: true,
      monthlyProfitSummary: {
        expenses,
        totalSellingPrice,
        totalCollectionDue,
        totalCost,
        totalExpenses,
        totalProfit,
      },
    });
  }
    const projects = await projectdetailsModel.find({ isDeleted: false });
    const hours = await hoursModel.find({ isDeleted: false });
    const expenses = await expensesModel.find({  isDeleted: false,
      selectDate: {
        $gte: formattedFromDate,
        $lte: formattedToDate,
      }, });

    let totalSellingPrice = 0;
    let totalCollectionDue = 0;
    let totalCost = 0;
    let totalExpenses = 0;

    // Calculate total selling price and collection due from projects
    projects.forEach((project) => {
      totalSellingPrice += project.sellingPrice;
      totalCollectionDue += project.collectiondue;   //Overall due this month
    });

    // Calculate total cost from hours
    hours.forEach((hour) => {
      totalCost += hour.costhour;
    });

    // Calculate total expenses
    expenses.forEach((expense) => {
      totalExpenses += expense.addAmount; //Amount spent this month
    });

    // Calculate total profit
    const totalProfit = Math.abs(totalSellingPrice - (totalCost + totalExpenses)); //Total profits this month

    return res.status(200).send({
      status: true,
      monthlyProfitSummary: {
        expenses,
        totalSellingPrice,
        totalCollectionDue,
        totalCost,
        totalExpenses,
        totalProfit,
      },
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});


// get expenses wrt id
router.get("/V1/expenses/:expenseid", async (req, res) => {
  try {
    const expensesid = req.params.expenseid;

    const expensesdata = await expensesModel.findOne({
      id: expensesid,
      // isDeleted: false,
    });
    return res.status(200).send(expensesdata);
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

//edit the data
router.put("/V1/updateexpense/:expenseid", async (req, res) => {
  try {
    const expensesid = req.params.expenseid;

    console.log(expensesid);
    const clientExists = await expensesModel.findOne({ id: expensesid });

    const updatedData = await expensesModel.findOneAndUpdate(
      { id: expensesid },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    return res.status(200).send(updatedData);
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

router.delete("/V1/expensesDelete", async (req, res) => {
  try {
    const result = await expensesModel.deleteMany({});
    res.send(`Deleted ${result.deletedCount} expensedata`);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ status: false, msg: "server error", error: err.message });
  }
});




router.delete("/V1/expensesDelete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const member = await expensesModel.findOne({ id: id });
    if (!member) {
      return res.status(404).send({ status: false, message: `expense not found or already deleted` });
    }
    const deletedData = await expensesModel.findOneAndDelete({ id: id });
    return res.status(200).send(deletedData);
  } catch (err) {
    return res.status(500).send({ status: false, message: "Server error", error: err.message });
  }
});

module.exports = router;

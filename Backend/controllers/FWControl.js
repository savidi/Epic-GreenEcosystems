const FieldWorker = require("../model/FWModel");

exports.getAllWorkers = async (req, res) => {
  try {
    const fieldworkers = await FieldWorker.find();
    res.status(200).json({ status: "success", data: fieldworkers });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};

exports.addWorkers = async (req, res) => {
  try {
    const worker = await FieldWorker.create(req.body);
    res.status(201).json({ status: "success", data: worker });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const worker = await FieldWorker.findById(req.params.id);
    if (!worker) return res.status(404).json({ status: "fail", message: "Worker not found" });
    res.status(200).json({ status: "success", data: worker });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};

exports.updateWorker = async (req, res) => {
  try {
    const worker = await FieldWorker.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!worker) return res.status(404).json({ status: "fail", message: "Worker not found" });
    res.status(200).json({ status: "success", data: worker });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};

exports.deleteWorker = async (req, res) => {
  try {
    const worker = await FieldWorker.findByIdAndDelete(req.params.id);
    if (!worker) return res.status(404).json({ status: "fail", message: "Worker not found" });
    res.status(200).json({ status: "success", message: "Worker deleted successfully" });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};

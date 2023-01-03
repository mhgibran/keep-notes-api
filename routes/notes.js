var express = require("express");
var router = express.Router();
var Validator = require("validatorjs");
const { notes } = require("../models");
const { Op } = require("sequelize");

router.get("/", async function (req, res) {
  const data = await notes.findAll();

  return res.status(200).json({
    data: data,
  });
});

router.get("/:id", async function (req, res) {
  const data = await notes.findOne({ where: { id: req.params.id } });

  return res.status(200).json({
    data: data,
  });
});

router.post("/", async function (req, res) {
  var rules = {
    title: "required|string|max:255",
    note: "required|string",
  };

  var validation = new Validator(req.body, rules);

  if (validation.fails())
    return res.status(400).json({
      success: false,
      status: 400,
      errors: validation.errors.all(),
    });

  try {
    const data = await notes.create(req.body);

    return res.status(200).json({
      success: true,
      status: 200,
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      errors: error,
    });
  }
});

router.put("/:id", async function (req, res) {
  var rules = {
    title: "required|string|max:255",
    note: "required|string",
  };

  var validation = new Validator(req.body, rules);

  if (validation.fails())
    return res.status(400).json({
      success: false,
      status: 400,
      errors: validation.errors.all(),
    });

  try {
    await notes.update(
      { title: req.body.title, note: req.body.note },
      { where: { id: req.params.id } }
    );

    return res.status(200).json({
      success: true,
      status: 200,
      data: await notes.findOne({ where: { id: req.params.id } }),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      errors: error,
    });
  }
});

router.delete("/:id", async function (req, res) {
  try {
    await notes.destroy({ where: { id: req.params.id } });

    return res.status(200).json({
      success: true,
      status: 200,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      errors: error,
    });
  }
});

router.get("/trashed", async function (req, res) {
  const data = await notes.findAll({
    where: {
      deletedAt: {
        [Op.not]: null,
      },
    },
    paranoid: false,
  });

  return res.status(200).json({
    data: data,
  });
});

router.post("/restore/:id", async function (req, res) {
  try {
    if (req.params.id === "all") {
      await notes.restore({
        where: {
          deletedAt: {
            [Op.not]: null,
          },
        },
        paranoid: false,
      });
    } else {
      await notes.restore({
        where: {
          id: req.params.id,
        },
      });
    }

    return res.status(200).json({
      success: true,
      status: 200,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      errors: error,
    });
  }
});

module.exports = router;

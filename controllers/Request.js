const Request = require("../model/request");
const Sales = require("../model/sales");
const Company = require("../model/company");

const createRequestPerClient = async (req, res) => {
  const { saleId, status, clientId } = req.body;
  try {
    const existingSales = await Sales.find({ clientId });

    if (!req.user || !req.user.id) {
      return res
        .status(400)
        .json({ error: "There is no company registered as user." });
    }

    if (existingSales.length > 0) {
      const productIds = existingSales.flatMap((sale) => sale.productId);
      const quantity = productIds.length;

      const existingRequest = await Request.findOne({ saleId });

      if (!existingRequest) {
        const newRequest = new Request({
          saleId,
          status,
          quantity,
          productId: productIds,
          clientId,
          companyId: req.user.id,
        });

        await newRequest.save();

        res.json(newRequest).status(201);

        const companyProduct = await Company.findOne({
          _id: newRequest.companyId,
        });

        companyProduct.requestId.push(newRequest);

        companyProduct.save();
      } else {
        res
          .json({ error: "There is already a request with this saleId." })
          .status(404);
      }
    } else {
      res
        .json({ error: "Could not find any sales that match the clientId." })
        .status(404);
    }
  } catch (error) {
    console.log(error);
    res.json({ error: "It was not possible to create a request." }).status(500);
  }
};

const createRequest = async (req, res) => {
  const { saleId, status } = req.body;
  try {
    let existingSale = await Sales.findOne({ saleId });
    const existingRequest = await Request.findOne({ saleId });
    if (existingSale) {
      let quantity = existingSale.productId.length;

      if (!existingRequest) {
        const newRequest = new Request({
          saleId,
          clientId: existingSale.clientId,
          productId: existingSale.productId,
          status,
          quantity,
          companyId: req.user.id,
        });
        await newRequest.save();
        res
          .json({
            message: "Request created successfully!",
            Request: newRequest,
          })
          .status(200);

        const companyProduct = await Company.findOne({
          _id: newRequest.companyId,
        });

        companyProduct.requestId.push(newRequest);

        companyProduct.save();
      } else {
        res
          .json({ error: "There is already a request for the sale." })
          .status(404);
      }
    } else {
      res.json({ error: "There is no sale with this saleId." });
    }
  } catch (error) {
    console.log(error);
    res.json({ error: "It was not possible to create a request." }).status(500);
  }
};

const getOneRequest = async (req, res) => {
  try {
    const Requests = await Request.find({ companyId: req.user.id });

    if (!Requests) {
      return res
        .status(404)
        .json({ error: "There is no request for this user." });
    }

    const paramId = await Request.find({ _id: req.params.id });

    if (!paramId) {
      return res
        .status(404)
        .json({ error: "There is no request id that match this param id." });
    }

    const existingRequest = await Request.findOne({
      _id: req.params.id,
      companyId: req.user.id,
    });

    res.json({ existingRequest }).status(200);
  } catch (error) {
    res.json({ error: "It was not possible to get this request." }).status(500);
  }
};

const getRequests = async (req, res) => {
  try {
    const allRequests = await Request.find({ companyId: req.user.id });

    if (!allRequests) {
      return res
        .status(404)
        .json({ error: "There is no request for this user." });
    }

    res.json({ allRequests }).status(200);
  } catch (error) {
    res.json({ error: "It was not possible to get all requests." }).status(500);
  }
};

const updateRequest = async (req, res) => {
  const { status } = req.body;
  try {

    const Requests = await Request.find({ companyId: req.user.id });

    if (!Requests) {
      return res
        .status(404)
        .json({ error: "There is no request for this user." });
    }

    const paramId = await Request.find({ _id: req.params.id });

    if (!paramId) {
      return res
        .status(404)
        .json({ error: "There is no request id that match this param id." });
    }

    let existingRequest = await Request.findOne({
      _id: req.params.id,
      companyId: req.user.id,
    });
    if (existingRequest) {
      existingRequest.status = status;
      await existingRequest.save();
      res.json(existingRequest).status(200);
    } else {
      res.json({ error: "There is not item that match this id." }).status(404);
    }
  } catch (error) {
    console.log(error);
    res.json({ error: "It was not possible to update." }).status(500);
  }
};

const deleteRequest = async (req, res) => {
  try {
    const response = await Request.findOneAndDelete({
      _id: req.params.id,
      companyId: req.user.id,
    });
    if (response) {
      res.json({ message: "The removal was successfull." }).status(200);
    } else {
      res.json("There is no request to remove.").status(404);
    }
  } catch (error) {
    console.log(error);
    res
      .json({ error: "It was not possible to delete this request." })
      .status(500);
  }
};

module.exports = {
  createRequestPerClient,
  createRequest,
  getOneRequest,
  getRequests,
  updateRequest,
  deleteRequest,
};

const Order = require("../../models/order.model");
const City = require("../../models/city.model");
const variableConfig = require("../../config/variable");
const moment = require("moment");

module.exports.list = async (req, res) => {
  const find = {
    deleted: false
  };

  const dateFiler = {};

  if(req.query.startDate) {
    const startDate = moment(req.query.startDate).startOf("date").toDate();
    dateFiler.$gte = startDate;
  }

  if(req.query.endDate) {
    const endDate = moment(req.query.endDate).endOf("date").toDate();
    dateFiler.$lte = endDate;
  }

  if(Object.keys(dateFiler).length > 0) {
    find.createdAt = dateFiler;
  }

  if (req.query.keyword) {
    const kw = req.query.keyword.trim();
    if (kw.length > 0) {
      const keywordRegex = new RegExp(kw, "i");
      find.$or = [
        { orderCode: keywordRegex },
        { fullName: keywordRegex },
        { phone: keywordRegex }
      ];
    }
  }

  const orderList = await Order
    .find(find)
    .sort({
      createdAt: "desc"
    });

  for (const orderDetail of orderList) {
    const pm = variableConfig.paymentMethod.find(item => item.value == orderDetail.paymentMethod);
    orderDetail.paymentMethodName = pm ? pm.label : (orderDetail.paymentMethod || "--");

    const ps = variableConfig.paymentStatus.find(item => item.value == orderDetail.paymentStatus);
    orderDetail.paymentStatusName = ps ? ps.label : (orderDetail.paymentStatus || "--");

    const os = variableConfig.orderStatus.find(item => item.value == orderDetail.status);
    orderDetail.statusName = os ? os.label : (orderDetail.status || "--");

    orderDetail.createdAtTime = moment(orderDetail.createdAt).format("HH:mm");
    orderDetail.createdAtDate = moment(orderDetail.createdAt).format("DD/MM/YYYY");
  }

  res.render("admin/pages/order-list", {
    pageTitle: "Quản lý đơn hàng",
    orderList: orderList
  })
}
module.exports.edit = async (req, res) => {
    try {
    const id = req.params.id;

    const orderDetail = await Order.findOne({
      _id: id,
      deleted: false
    })

    orderDetail.createdAtFormat = moment(orderDetail.createdAt).format("YYYY-MM-DDTHH:mm");

    for (const item of orderDetail.items) {
      const city = await City.findOne({
        _id: item.locationFrom
      });
      item.locationFromName = city.name;
      item.departureDateFormat = moment(item.departureDate).format("DD/MM/YYYY");
    }

    res.render("admin/pages/order-edit", {
        pageTitle: `Đơn hàng: ${orderDetail.orderCode}`,
      orderDetail: orderDetail,
      paymentMethod: variableConfig.paymentMethod,
      paymentStatus: variableConfig.paymentStatus,
      orderStatus: variableConfig.orderStatus
    })
  } catch (error) {
    res.redirect(`/${pathAdmin}/order/list`);
  }
}

module.exports.editPatch = async (req, res) => {
  try {
    const id = req.params.id;

    const order = await Order.findOne({
      _id: id,
      deleted: false
    });

    if(!order) {
      res.json({
        code: "error",
        message: "Thông tin đơn hàng không hợp lệ!"
      })
      return;
    }

    await Order.updateOne({
      _id: id,
      deleted: false
    }, req.body);

    req.flash("success", "Cập nhật đơn hàng thành công!");

    res.json({
      code: "success"
    })
  } catch (error) {
    res.json({
      code: "error",
      message: "Thông tin đơn hàng không hợp lệ!"
    })
  }
}

module.exports.deletePatch = async (req, res) => {
 
  try {
    const id = req.params.id;
    
   await Order.deleteOne({
      _id: id
    })

    req.flash("success", "Xóa tour thành công!");

    res.json({
      code: "success"
    })
  } catch (error) {
    res.json({
      code: "error",
      message: "Id không hợp lệ!"
    })
  }
}
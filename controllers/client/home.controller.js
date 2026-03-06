

const Tour = require("../../models/tour.model");
const moment = require("moment");
const categoryHelper = require("../../helpers/category.helper");

module.exports.home = async (req, res) => {
  // Section 2
  const tourListSection2 = await Tour
    .find({
      deleted: false,
      status: "active"
    })
    .sort({
      position: "desc"
    })
    .limit(6)

  for(const item of tourListSection2) {
    item.departureDateFormat = moment(item.departureDate).format("DD/MM/YYYY");
    
    item.stockAdult = item.stock || 0;
    if (item.soldCount) {
      item.stockAdult -= item.soldCount;
    }
  }
  // End Section 2

  // Section 4: Tour Trong Nước
  const categoryIdSection4 = "69aa75e6738e9eef6d0f395a"; // id danh mục Tour Trong Nước
  const listCategoryId = await categoryHelper.getAllSubcategoryIds(categoryIdSection4);

  const tourListSection4 = await Tour
    .find({
      category: { $in: listCategoryId },
      deleted: false,
      status: "active"
    })
    .sort({
      position: "desc"
    })
    .limit(3)

  for(const item of tourListSection4) {
    item.departureDateFormat = moment(item.departureDate).format("DD/MM/YYYY");
  }
  // End Section 4: Tour Trong Nước

  // Section 5: Tour Nước Ngoài
  const categoryIdSection5 = "69aa7655738e9eef6d0f3966"; // id danh mục Tour Nước Ngoài
  const listCategoryIdSection5 = await categoryHelper.getAllSubcategoryIds(categoryIdSection5);

  const tourListSection5 = await Tour
    .find({
      category: { $in: listCategoryIdSection5 },
      deleted: false,
      status: "active"
    })
    .sort({
      position: "desc"
    })
    .limit(3)

  for(const item of tourListSection5) {
    item.departureDateFormat = moment(item.departureDate).format("DD/MM/YYYY");
  }
  // End Section 5: Tour Nước Ngoài

  res.render("client/pages/home", {
    pageTitle: "Trang chủ",
    tourListSection2: tourListSection2,
    tourListSection4: tourListSection4,
    tourListSection5: tourListSection5
  })
}
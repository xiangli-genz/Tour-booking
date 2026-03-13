const Tour = require("../../models/tour.model");
const moment = require("moment");
const slugify = require('slugify');

module.exports.list = async (req, res) => {
  const find = {
    status: "active",
    deleted: false
  };

  // Điểm đi
  if(req.query.locationFrom) {
    find.locations = req.query.locationFrom;
  }

  // Điểm đến
  if(req.query.locationTo) {
    const keyword = slugify(req.query.locationTo, {
      lower: true
    });
    const keywordRegex = new RegExp(keyword);
    find.slug = keywordRegex;
  }

  // Ngày khởi hành  
  if(req.query.departureDate) {
    find.departureDate = new Date(req.query.departureDate);
  }

  // Thời gian đi tour (time)
  if(req.query.time) {
    const timeKeyword = req.query.time.trim();
    if(timeKeyword) {
      const timeRegex = new RegExp(timeKeyword, "i");
      find.time = timeRegex;
    }
  }

  // Số lượng hành khách
  if(req.query.stockAdult) {
    find.stockAdult = { $gte: parseInt(req.query.stockAdult) };
  }
  if(req.query.stockChildren) {
    find.stockChildren = { $gte: parseInt(req.query.stockChildren) };
  }
  if(req.query.stockBaby) {
    find.stockBaby = { $gte: parseInt(req.query.stockBaby) };
  }

  // Mức giá
  if(req.query.price) {
    const [priceMin, priceMax] = req.query.price.split("-").map(item => parseInt(item));
    find.priceNewAdult = {
      $gte: priceMin,
      $lte: priceMax
    };
  }

  const tourList = await Tour
    .find(find)
    .sort({ position: "desc" });

  for(const item of tourList) {
    item.departureDateFormat = moment(item.departureDate).format("DD/MM/YYYY");
  }

  res.render("client/pages/search", {
    pageTitle: "Kết quả tìm kiếm",
    tourList: tourList
  });
};

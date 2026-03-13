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
    const keyword = slugify(req.query.locationTo, { lower: true });
    find.slug = new RegExp(keyword);
  }

  // Ngày khởi hành
  if(req.query.departureDate) {
    find.departureDate = new Date(req.query.departureDate);
  }

  // Thời gian đi tour
  if(req.query.time) {
    const timeKeyword = req.query.time.trim();
    if(timeKeyword) {
      find.time = new RegExp(timeKeyword, "i");
    }
  }

  // Mức giá
  if(req.query.price) {
    const [priceMin, priceMax] = req.query.price.split("-").map(item => parseInt(item));
    find.priceNewAdult = { $gte: priceMin, $lte: priceMax };
  }

  // ---- Số lượng hành khách ----
  // Bắt buộc phải có người lớn >= 1
  const stockAdult    = Math.max(1, parseInt(req.query.stockAdult) || 1);
  const stockChildren = parseInt(req.query.stockChildren) || 0;
  const stockBaby     = parseInt(req.query.stockBaby) || 0;

  // Lọc tour còn đủ chỗ
  const findWithStock = {
    ...find,
    stockAdult: { $gte: stockAdult }
  };
  if(stockChildren > 0) findWithStock.stockChildren = { $gte: stockChildren };
  if(stockBaby > 0)     findWithStock.stockBaby = { $gte: stockBaby };

  let tourList = await Tour
    .find(findWithStock)
    .sort({ position: "desc" });

  // Nếu không còn tour nào đủ chỗ người lớn → lấy tất cả (không lọc stock)
  // và đánh dấu soldOut để hiển thị "Hết chỗ"
  let soldOut = false;
  if(tourList.length === 0) {
    tourList = await Tour
      .find(find)
      .sort({ position: "desc" });
    soldOut = true; // Báo cho view biết hiển thị trạng thái hết chỗ
  }

  for(const item of tourList) {
    item.departureDateFormat = moment(item.departureDate).format("DD/MM/YYYY");
    // Đánh dấu từng tour có hết chỗ người lớn hay không
    item.isAdultSoldOut = item.stockAdult < stockAdult;
  }

  res.render("client/pages/search", {
    pageTitle: "Kết quả tìm kiếm",
    tourList: tourList,
    soldOut: soldOut,
    stockAdultRequired: stockAdult
  });
};

const moment = require("moment");
const Contact = require("../../models/contact.model");

module.exports.list = async (req, res) => {
  const find = {
    deleted: false
  };

  const dateFilter = {};

  if(req.query.startDate) {
    const startDate = moment(req.query.startDate).startOf("date").toDate();
    dateFilter.$gte = startDate;
  }

  if(req.query.endDate) {
    const endDate = moment(req.query.endDate).endOf("date").toDate();
    dateFilter.$lte = endDate;
  }

  if(Object.keys(dateFilter).length > 0){
    find.createdAt = dateFilter;
  }

  if (req.query.keyword) {
  const keywordRegex = new RegExp(req.query.keyword, "i"); 
  find.email = keywordRegex;
}


  const contactList = await Contact.find(find).sort({
    createdAt: "desc"
  });

  for (const item of contactList) {
    item.createdAtFormat = moment(item.createdAt).format("HH:mm - DD/MM/YYYY");
  }

  res.render("admin/pages/contact-list", {
    pageTitle: "Thông tin liên hệ",
    contactList: contactList
  });
};

module.exports.deletePatch = async (req, res) => {
  try {
    const id = req.params.id;
    const contact = await Contact.findOne({ _id: id});
    if (!contact) {
      return res.json({ code: 'error', message: 'Liên hệ không tồn tại' });
    }

    await Contact.deleteOne({ _id: id });

    req.flash('success', 'Xóa liên hệ thành công');
    res.json({ code: 'success' });
  } catch (error) {
    res.json({ code: 'error', message: 'Xóa thất bại' });
  }
}

module.exports.changeMultiPatch = async (req, res) => {
  try {
    const option = req.body.option || req.body.type;
    const ids = req.body.ids;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.json({ code: 'error', message: 'Chưa chọn liên hệ nào' });
    }

    switch (option) {
      case 'delete':
        await Contact.deleteMany({ _id: { $in: ids } });
        req.flash('success', 'Xóa liên hệ thành công');
        break;
      default:
        return res.json({ code: 'error', message: 'Hành động không hợp lệ' });
    }

    res.json({ code: 'success' });
  } catch (error) {
    res.json({ code: 'error', message: 'Thao tác thất bại' });
  }
}
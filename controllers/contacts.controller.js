const contactsSocket = require('../sockets/client/contacts.socket.js');
const User = require('../models/user.model.js');

// [GET] /contacts
module.exports.index = async (req, res, next) => {
  //! socket.io
  contactsSocket(res);
  //! end socket.io

  const user = await User.findOne({
    _id: req.user._id
  }).populate({
    path: 'contactList.user',
    select: 'fullName username avatar'
  }).populate({
    path: 'contactBlocked',
    select: 'fullName username avatar'
  })
  .lean();

  let contactList = user.contactList.sort((a, b) => {
    return a.user.username.localeCompare(b.user.username);
  }) || [];
  let contactBlocked = user.contactBlocked || [];
  let favoriteList = contactList.filter(contact => contact.favorite === true) || [];
  let recentContactList = contactList.sort((a, b) => {
    return new Date(b.addedAt) - new Date(a.addedAt);
  }) || [];

  let recommendedAddContact = await User.find({
    deleted: false,
    statusAccount: "active",
    _id: {
      $nin: [...contactList.map(contact => contact.user._id), ...contactBlocked.map(contact => contact._id), req.user._id]
    }
  })
    .select('fullName username avatar')
    .limit(5)
    .lean();
  
  let firstContact;
  if (contactList.length > 0 && contactList[0].user) {
    firstContact = contactList[0].user;
  } else {
    firstContact = recommendedAddContact[0];
  }
  firstContact = await User.findById(firstContact._id)
    .select('fullName username email phone avatar cover bio contactList groups gender statusOnline')
    .populate({
      path: 'contactList.user',
      select: 'fullName avatar username'
    })
    .lean();

    const mutualContact = user.contactList.filter(contact => {
      return firstContact.contactList.some(c => c.user._id.toString() === contact.user._id.toString());
    });  

  // return res.json({
  //   contactList,
  //   contactBlocked,
  //   favoriteList,
  //   recentContactList,
  //   recommendedAddContact,
  //   firstContact
  // })

  res.render('client/pages/contacts/index', {
    pageTitle: 'Contacts',
    activeTab: 'contacts',
    contactList,
    contactBlocked,
    favoriteList,
    recentContactList,
    recommendedAddContact,
    displayContact: firstContact,
    mutualContact
  })
};
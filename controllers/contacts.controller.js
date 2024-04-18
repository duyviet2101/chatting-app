const contactsSocket = require('../sockets/client/contacts.socket.js');
const User = require('../models/user.model.js');

// [GET] /contacts
module.exports.index = async (req, res, next) => {
  //! socket.io
  contactsSocket(req, res);
  //! end socket.io

  const user = await User.findOne({
      _id: req.user._id,
    }).populate({
      path: 'contactList.user',
      select: 'fullName username avatar'
    }).populate({
      path: 'contactBlocked',
      select: 'fullName username avatar'
    }).populate({
      path: 'contactRequestsReceived',
      select: 'fullName username avatar'
    }).populate({
      path: 'contactRequestsSent',
      select: 'fullName username avatar'
    })
    .lean();

  let contactList = user.contactList?.sort((a, b) => {
    return a.user.username.localeCompare(b.user.username);
  }) || [];
  let contactBlocked = user.contactBlocked || [];
  let contactRequestsReceived = user.contactRequestsReceived || [];
  let contactRequestsSent = user.contactRequestsSent || [];

  let recommendedAddContact = await User.find({
      deleted: false,
      statusAccount: "active",
      _id: {
        $nin: [...contactList.map(contact => contact.user._id), ...contactBlocked.map(contact => contact._id), req.user._id, ...user.contactRequestsReceived.map(contact => contact._id), ...user.contactRequestsSent.map(contact => contact._id)]
      }
    })
    .select('fullName username avatar')
    .limit(5)
    .lean();

  let firstContact = null;
  if (contactList.length > 0 && contactList[0].user) {
    firstContact = contactList[0].user;
  } else {
    firstContact = recommendedAddContact[0];
  }
  if (firstContact)
    firstContact = await User.findById(firstContact._id)
      .select('fullName username email phone avatar cover bio contactList groups gender statusOnline')
      .populate({
        path: 'contactList.user',
        select: 'fullName avatar username'
      })
      .lean();

  const mutualContact = user.contactList?.filter(contact => {
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
    contactRequestsReceived,
    contactRequestsSent,
    recommendedAddContact,
    displayContact: firstContact,
    mutualContact
  })
};

// [GET] /contacts/profile/:username
module.exports.profile = async (req, res, next) => {
  //! socket.io
  contactsSocket(req, res);
  //! end socket.io

  const user = await User.findOne({
      _id: req.user._id,
    }).populate({
      path: 'contactList.user',
      select: 'fullName username avatar'
    }).populate({
      path: 'contactBlocked',
      select: 'fullName username avatar'
    }).populate({
      path: 'contactRequestsReceived',
      select: 'fullName username avatar'
    }).populate({
      path: 'contactRequestsSent',
      select: 'fullName username avatar'
    })
    .lean();

  let contactList = user.contactList?.sort((a, b) => {
    return a.user.username.localeCompare(b.user.username);
  }) || [];
  let contactBlocked = user.contactBlocked || [];
  let contactRequestsReceived = user.contactRequestsReceived || [];
  let contactRequestsSent = user.contactRequestsSent || [];

  let recommendedAddContact = await User.find({
      deleted: false,
      statusAccount: "active",
      _id: {
        $nin: [...contactList.map(contact => contact.user._id), ...contactBlocked.map(contact => contact._id), req.user._id, ...user.contactRequestsReceived.map(contact => contact._id), ...user.contactRequestsSent.map(contact => contact._id)]
      }
    })
    .select('fullName username avatar')
    .limit(5)
    .lean();

  const displayContact = await User.findOne({
      username: req.params.username,
      deleted: false,
      statusAccount: "active",
      _id: {
        $nin: [...contactBlocked.map(contact => contact._id), req.user._id]
      }
    })
    .select('fullName username email phone avatar cover bio contactList groups gender statusOnline')
    .populate({
      path: 'contactList.user',
      select: 'fullName avatar username'
    })
    .lean();

  if (!displayContact) {
    req.flash('error', 'User not found');
    return res.redirect('/contacts');
  }

  const mutualContact = user.contactList?.filter(contact => {
    return displayContact.contactList.some(c => c.user._id.toString() === contact.user._id.toString());
  });

  // return res.json({
  //   contactList,
  //   contactBlocked,
  //   favoriteList,
  //   recentContactList,
  //   recommendedAddContact,
  //   displayContact
  // })

  res.render('client/pages/contacts/index', {
    pageTitle: 'Contacts',
    activeTab: 'contacts',
    contactList,
    contactBlocked,
    contactRequestsReceived,
    contactRequestsSent,
    recommendedAddContact,
    displayContact: displayContact,
    mutualContact,
    username: req.params.username
  })
};
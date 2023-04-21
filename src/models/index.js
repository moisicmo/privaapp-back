
const userModel = require('./user.model');
const userGroupModel = require('./user_group.model');
const guestModel = require('./guest.model');
const groupModel = require('./group.model');
const forgotPasswordModel = require('./forgot_password.model');
const contentModel = require('./content.model');
const alertModel = require('./alert.model');

userGroupModel.belongsTo(userModel, { foreignKey: 'user_id' });
userGroupModel.belongsTo(groupModel, { foreignKey: 'group_id' });



module.exports = {
    userModel,
    userGroupModel,
    guestModel,
    groupModel,
    forgotPasswordModel,
    contentModel,
    alertModel,
}
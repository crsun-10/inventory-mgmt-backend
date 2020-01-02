var btoa = require("btoa");
// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

// eslint-disable-next-line no-unused-vars
module.exports = (options = {}) => {
  return async context => {
    const { app, method, result, params } = context;
    const email = context.params.query.email;

    const type = context.data.type;
    const pengdingInvitationId = context.data.pengdingInvitationId;
    // The logged in user
    const { user } = context.params;
    if (type && type.split(",")[0] == "newStaff") {
      // send invitation
      const url = `${
        context.params.headers.origin
      }/authentication/accept-invitation?from=${btoa(type.split(",")[1])}`;
      let formData = {
        email: email,
        pengdingInvitationId: pengdingInvitationId,
        senderName: user.name,
        senderEmail: user.email,
        url: url
      };
      app.service("send-invitation-to-newstaff").find({ query: formData });
    }
    return context;
  };
};

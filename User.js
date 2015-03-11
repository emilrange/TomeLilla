/**
/* The generic User class for all protocols.
/* It has the most common relevant fields
*/

module.exports = function(userName, show, userStatus)
{
    this.userName = userName;
    this.show = show;
    this.userStatus = userStatus;
    this.online = true;
}

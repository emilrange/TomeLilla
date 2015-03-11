
Irc = require('./Irc');
User = require('./User');
Methods = require('./Methods')

var testCases = new Array(true);

/* ====================================================
/* Test case 1:
/*  This test case will let user have channels #abcde and #qwerty as channels to find contacts in.
/*  Our "test-IRC-handler" will send contacts if get JOIN request.
/*  When done the contactlist should have a certain list. 
*/
config = new Object();
config.channels = new Array('#abcde','#qwerty');
irc = new Irc();
irc.config = config;
irc.instance = new Object();
irc.instance.userName = "Emil";
irc.instance.contactList = new Array();
irc.dcConnection = new Object();
irc.dcConnection.write = function(data)
{
    if(data=="JOIN #abcde\r\n") irc.handleData(":___ 353 range2 @ #abcde :Emil aa1 aa2");
    if(data=="JOIN #qwerty\r\n") irc.handleData(":___ 353 range2 = #qwerty :Emil gg1 gg2 gg3 @gg4");
}
irc.xmpp = new Object();
irc.xmpp.updateRosterAndPresence = function(){}

irc.handleData(""); // For now our irc connection starts after get first data (to make sure irc handler is ready)

testCases[1] = ('[{"userName":"aa1","show":"xa","userStatus":"","online":true},{"userName":"aa2","show":"xa","userStatus":"","online":true},{"userName":"gg1","show":"xa","userStatus":"","online":true},{"userName":"gg2","show":"xa","userStatus":"","online":true},{"userName":"gg3","show":"xa","userStatus":"","online":true},{"userName":"gg4","show":"xa","userStatus":"","online":true}]'==JSON.stringify(irc.instance.contactList));

//
/* ==================================================== */


/* ====================================================
/* Test case 2:
/*  This test case has a defined contactlist with mixed offline and online users. "test-IRC-handler" has a certian went offline and online event list 
/*  that irc connection gets data from. When end of event list the contactList should have correct status on correct users
*/
config = new Object();
config.channels = new Array('');
var tc1=0;
irc = new Irc();
irc.config = config;
irc.instance = new Object();
irc.instance.userName = "Emil";
irc.instance.contactList = new Array();
irc.dcConnection = new Object();
irc.dcConnection.write = function(data)
{
    if(data=="ISON andrew lisa")
    { 
        if(tc1==0) { irc.handleData(":___ 303 Emil :"); tc1++; }
        else if(tc1==1) { irc.handleData(":___ 303 Emil :andrew"); tc1++ }
        else if(tc1==2) { irc.handleData(":___ 303 Emil :lisa"); tc1++; }
        else if(tc1==3) { irc.handleData(":___ 303 Emil :andrew lisa"); tc1++; }
    }
}

irc.xmpp = new Object();
irc.xmpp.updateRosterAndPresence = function(){}

irc.handleData(""); // For now our irc connection starts after get first data (to make sure irc handler is ready)

irc.instance.contactList.push(new User("andrew","xa",""));
irc.instance.contactList.push(new User("lisa","xa",""));


var tc1testFailed = false;
irc.checkOnlineStatus();
if( JSON.stringify(irc.instance.contactList)!=
   '[{"userName":"andrew","show":"xa","userStatus":"","online":false},{"userName":"lisa","show":"xa","userStatus":"","online":false}]') tc1testFailed = true;
irc.checkOnlineStatus();
if( JSON.stringify(irc.instance.contactList)!=
   '[{"userName":"andrew","show":"xa","userStatus":"","online":true},{"userName":"lisa","show":"xa","userStatus":"","online":false}]') tc1testFailed = true;
irc.checkOnlineStatus();
if( JSON.stringify(irc.instance.contactList)!=
    '[{"userName":"andrew","show":"xa","userStatus":"","online":false},{"userName":"lisa","show":"xa","userStatus":"","online":true}]') tc1testFailed = true;
irc.checkOnlineStatus();
if( JSON.stringify(irc.instance.contactList)!=
    '[{"userName":"andrew","show":"xa","userStatus":"","online":true},{"userName":"lisa","show":"xa","userStatus":"","online":true}]') tc1testFailed = true;

testCases[2] = !tc1testFailed;
//
/* ==================================================== */


console.log(testCases);


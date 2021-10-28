'use strict';

var socket;
var username;
window.onload = () => {
	try {
	localStorage ? (() => {
		localStorage.getItem("username") === null ? (() => {
    "use strict";
    var entered = !1;
    popup({
      beforeClose: () => entered,
      modal: true,
      html: true,
      title: "Welcome",
      buttons: {
        Go: () => {
          localStorage.setItem("username", $("#username")[0].value === "" ? "user" : $("#username")[0].value);
          username = localStorage.username;
          entered = true;
          $("#dialog").dialog("close");
        }
      }
    }, `<input id="username" style="width:100%;" placeholder="Please enter your username" type="text">`);
  })() : (() => {
    username = localStorage.username;
  })();
	})() : (() => {
		popup({
      	beforeClose: () => !1,
      	modal: true,
      	title: "Error"
      }, `Your browser is incompatable with WebSenger (You don't support localStorage)`);
		})(); 
	} catch (e) {
		popup({
      	beforeClose: () => !1,
      	modal: true,
      	title: "Error"
      }, `Your browser is incompatable with WebSenger`);
	}
socket = io();
socket.on('recieve', (json) => {
    if (json.id !== socket.id) $("#chatmsgs").append(uiMsg(json.message, 1));
  });
  socket.on('alert', (msg) => alert(msg));
  socket.on('join', (room, pass, type) => {
    $("#Header2>*:nth-child(1)").text(room);
    $("#chatmsgs").html("");
    if (!type) $("#Rooms").prepend(uiRoom(room, pass));
  });
  socket.on("created", (room_name, passcode) => {
    socket.emit("join", room_name, username, passcode, 0);
  });
  socket.on("deleted", (room_name) => {
	$("#chatmsgs").html("");
	if ($("#Header2>*:nth-child(1)").text() == room_name) $("#Header2>*:nth-child(1)").text("None");
    removeRoomByName(room_name);
  });
  var sparams = new URLSearchParams(location.search);
  if (sparams.has("username") && sparams.has("room") && sparams.get("room")) {
	  if (sparams.has("pass")) {
		  if (sparams.get("pass")) {
			  socket.emit("join",sparams.get("room"),sparams.get("username"),sparams.get("pass"),0);
			  username = sparams.get("username");
		  } else {
			  alert("Pass was empty in RoomLink");
		  }
	  } else {
		  socket.emit("join",sparams.get("room"),sparams.get("username"),"",0);
		  username = sparams.get("username");
	  }
  }
}
var popup = (options, content) => {
  "use strict";
  if (options.html) $("#dialog").html(content);
  if (!options.html) $("#dialog").text(content);
  $("#dialog").dialog(options);
};
var removeRoomByName = (name) => {
  var roomNames = [];
  for (const child of Array.from($("#Rooms")[0].children)) {
    if (Array.from($("#Rooms")[0].children).indexOf(child) != Array.from($("#Rooms")[0].children).length - 1) {
      roomNames.push(child.children[0].innerText)
    }
  };
  if (roomNames.includes(name)) {
    $(Array.from($("#Rooms")[0].children)[roomNames.indexOf(name)]).remove();
  }
}
var escape = (html) => {
  "use strict";
  var escape = document.createElement('textarea');
  escape.textContent = html;
  var escaped = escape.innerHTML;
  escape.remove();
  return escaped;
};
var stopPropagation = () => {
  "use strict";
  var e;
  if (!e) e = window.event;
  e.cancelBubble = true;
  if (e.stopPropagation) e.stopPropagation();
};
var uiRoom = (name,pass) => {
	return `<div class="room" onclick="room_join(this)"><span>${name}</span><i onclick="room_delete(this)" style="cursor:pointer;" class="fa-duotone fa-octagon-xmark"></i><br><span onclick="navigator.clipboard.writeText('https://websenger.elijah629.repl.co/join?room=${name}&pass=${pass}');" style="cursor:pointer;">Copy Link</span><span>${pass}</span></div>`;
}
var room_delete = (element) => {
	stopPropagation();
	$(element.parentNode).remove();
  	socket.emit("delete", element.parentNode.children[0].innerText);
}
var uiMsg = (msg, type = 0) => {
  return `<li class=\"${type===0?"msg-you":"msg-them"}\">${msg}</li>`;
};
var send = (event,element) => {
	if (event.keyCode == 13 && element.value != "") {
		var msg = escape(element.value);
    	$("#chatmsgs").append(uiMsg(msg, 0));
    socket.emit("send", {
      "message": msg,
      "id": socket.id
    });
    element.value = "";
	}
}
var room_add = () => {
	"use strict";
  popup({
    width: 500,
    title: "Add Room",
    html: true,
    modal: true,
    buttons: {
      Create: () => {
		  if ($("#DRoomName")[0].value != "") {
        socket.emit("create", $("#DRoomName")[0].value, $("#DPasscode")[0].value);
        $("#dialog").dialog('close');
		  }
      },
      Cancel: () => {
        $("#dialog").dialog('close');
      }
    }
  }, `
		<div>
			<input id="DRoomName" placeholder="Room Name" style="width:100%;" type="text">
			<br/>
			<input id="DPasscode" placeholder="Passcode (Leave empty if none)" style="width:100%;" type="text">
		</div>`);
}
var room_join = (element) => {
	"use strict";
  stopPropagation();
  $("#chatmsgs").html("");
  $("#Header2>*:nth-child(1)").text(element.children[0].innerText);
  socket.emit("join", element.children[0].innerText, username, element.children[4].innerText, 1);
}
var room_connect = () => {
	"use strict";
  popup({
    title: "Connect to room",
    html: true,
    width: 500,
    modal: true,
    buttons: {
      Connect: () => {
		  if ($("#CRoomName")[0].value != "") {
        socket.emit('join', $("#CRoomName")[0].value, username, $("#CPasscode")[0].value, 0);
        $("#Header2>*:nth-child(1)").text($("#CRoomName")[0].value);
        $("#dialog").dialog('close');
		  }
      },
      Cancel: () => {
        $("#dialog").dialog('close');
      }
    }
  }, `
		<div>
			<input id="CRoomName" placeholder="Room Name" style="width:100%;" type="text">
			<br/>
			<input id="CPasscode" placeholder="Passcode (Leave empty if none)" style="width:100%;" type="text">
		</div>
	`);
}
const util = require("util");
let socketio = require('socket.io');

module.exports.listen = function(server){
    let io = socketio.listen(server);

    // ------------------------------ Traitement du socket
    let objUtilisateur = {}
    let msgList = {}
    io.on('connection', function(socket){
	    // .......
	    socket.on("setUser", function(data){

	    	objUtilisateur[socket.id] = data.user;
	    	socket.emit("valid_user", data);
	    	io.sockets.emit("diffuser_list_user", objUtilisateur);

	    });

	    socket.on("setMsg", function(data){

	    	data.user = objUtilisateur[socket.id];
	    	socket.broadcast.emit("diffuser_message", data);
	    	socket.emit("valid_message", data);

	    });

	    socket.on("disconnect", function(){

	    	delete objUtilisateur[socket.id];
	    	io.sockets.emit("diffuser_list_user", objUtilisateur);

	    });
   });

 return io;
}

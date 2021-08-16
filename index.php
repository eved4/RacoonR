<!-- include jquery and socket IO -->

<script src="js/jquery.js"></script>
<script src="socket.io.js"></script>

<form onsubmit="return enterName();">
    <input id="name" placeholder="enter name">
    <input type="submit">
</form>

<script>
// creating io instance
var io = io("http://localhost:3000");
function enterName() {
    var name = document.getElementById("name").value;

    io.emit("user_connected", name);
    return false;
}
</script>
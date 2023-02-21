const { handler } = require("./index.js");
console.clear();
var event={
    requestContext:{http:{method:"POST"}},
    headers:{origin:"http://localhost:81", referer:"http://localhost:81"},
    body:"{\"email\":\"some login\",\"password\":\"MyPassword\",\"passwordRepeated\":\"MyPassword\"}"
};
handler(event, {}, function() {
    console.log("unit test done.");
});
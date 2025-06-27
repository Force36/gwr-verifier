const express = require('express');
const path = require('path');

const app = express();
// We'll use port 8080 as it was working for you.
const PORT = 8080; 

// This single line is the only thing we need.
// It tells the server to serve all files from the 'public' folder.
app.use(express.static(path.join(__dirname, 'public')));

// Start the server.
app.listen(PORT, () => {
    console.log(`--- Server is running successfully! ---`);
    console.log(`The verification tool is now available.`);
    console.log(`Please visit: http://<your_server_ip>:${PORT}`);
});



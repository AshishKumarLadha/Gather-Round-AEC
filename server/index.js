const express = require('express');
const cors = require('cors'); // Using for cross-origin requests

const authRoutes = require("./routes/auth.js")

const app = express();
const PORT = process.env.PORT || 5000;

require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
const twilioClient = require('twilio')(accountSid, authToken);


//Setting up the middleware
app.use(cors()); // allowing us to make cross-origin requests
app.use(express.json()); // allowing to pass json payloads from the frontend to backend
app.use(express.urlencoded());

app.get('/', (req, res) => {
    res.send('Hello World!');
});


app.post('/', (req, res) => {
    const { message, user: sender, type, members } = req.body;

    if(type === 'message.new'){
        members
            .filter((member) => member.user_id !== sender.id)
            .forEach(({ user }) => {
                if(!user.online) {
                    twilioClient.messages.create({
                        body: `You have a new message from ${message.user.fullName} - ${message.text}`,
                        messagingServiceSid: messagingServiceSid,
                        to: user.phoneNumber
                    })
                        .then(() => console.log('Message Sent!'))
                        .catch((err) => console.log(err));
                }

            })
            return res.status(200).send('Message Sent!');
    }
    return res.status(200).send('Not a new message request');
})

app.use('/auth', authRoutes);



app.listen(PORT, () => console.log(`Server Running on ${PORT}`));
require('dotenv').config();

const { Client: WhatsAppClient } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 1995;

const apiKeyMiddleware = (req, res, next) => {
    const authHeader = req.get('Authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (token && token === process.env.API_KEY) {
        next();
    } else {
        res.status(401).send({ status: 'error', message: 'Invalid or missing API key' });
    }
};

// Initializing WhatsApp client and API server
const whatsappClient = new WhatsAppClient();
whatsappClient.on('qr', qr => { qrcode.generate(qr, {small: true});});
whatsappClient.on('ready', () => { 
    console.log('WhatsApp client is ready!');
    
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        app.use('/send-message', apiKeyMiddleware);
    });
});
whatsappClient.initialize().catch(error => {
    console.error('Error initializing WhatsApp client:', error);
});

app.post('/send-message', apiKeyMiddleware, async (req, res) => {
    const { recipient, message } = req.body;
    console.log(`Received send-message request: Recipient - ${recipient}, Message - ${message}`);

    if (!recipient) {
        console.error('Validation Error: Recipient field is empty');
        return res.status(400).send({ status: 'error', message: 'Recipient field cannot be empty' });
    }

    const recipientPattern = /^\d+(-\d+)?$/;
    if (!recipientPattern.test(recipient)) {
        console.error('Validation Error: Invalid recipient format', recipient);
        return res.status(400).send({ status: 'error', message: 'Invalid recipient format' });
    }

    const isGroupChat = /\d+-\d+/.test(recipient);
    const chatId = `${recipient}${isGroupChat ? '@g.us' : '@c.us'}`;

    try {
        const response = await whatsappClient.sendMessage(chatId, message);
        res.send({ status: 'success', message: 'Message sent', response });
        console.log(`Message sent successfully: Recipient - ${recipient}, Chat ID - ${chatId}`);
    } catch (error) {
        console.error(`Error sending message to ${recipient}:`, error);
        res.status(500).send({ status: 'error', message: 'Failed to send message', error });
    }
});
const express = require('express');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
const cors = require('cors');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
const app = express();

app.use(bodyParser.json());
app.use(cors());

app.post('/api/referrals', async (req, res) => {
  const { referringPerson, referredPerson, course, referringEmail, referredEmail } = req.body;

  if (!referringPerson || !referredPerson || !course || !referringEmail || !referredEmail) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const referral = await prisma.referral.create({
      data: {
        referringPerson,
        referredPerson,
        course,
        referringEmail,
        referredEmail,
      },
    });

    // Send email notification
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'creator10072002@gmail.com', // replace with your email
        pass: 'pbso reow jvsf rjhm', // replace with your email password
      },
    });

    const mailOptions = {
      from: 'creator10072002@gmail.com',
      to: referredEmail,
      subject: 'You have been referred!',
      text: `Hi ${referredPerson},\n\nYou have been referred to the ${course} course by ${referringPerson}.\n\nBest regards,\nYour Company`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    res.status(201).json(referral);
  } catch (error) {
    console.error('Error creating referral:', error);
    res.status(500).json({ error: 'An error occurred while creating the referral.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

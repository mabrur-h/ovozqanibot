import dotenv from 'dotenv';

dotenv.config();

export default {
    PG_CONNECTION_STRING: process.env.PG_CONNECTION_STRING,
    TOKEN: process.env.BOT_TOKEN,
    FORWARD_POST_CHANNEL: process.env.FORWARD_POST_CHANNEL
}
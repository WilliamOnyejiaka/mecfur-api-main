import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import env, {EnvKey} from "../config/env";


export default class Email {

    private readonly transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo, SMTPTransport.Options>;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // Use TLS
            auth: {
                user: 'mirordev@gmail.com', // TODO: add this to env
                pass: env(EnvKey.SMTP_PASSWORD),
            },
        });
    }

    public async getEmailTemplate(data: any, templatePath: string = path.join(__dirname, './../views', "email.ejs")) {
        const htmlContent = await ejs.renderFile(templatePath, data);
        return htmlContent;
    }

    public async sendEmail(from: string, to: string, subject: string, html: string) {

        const mailOptions = {
            from: from,
            to: to,
            subject: subject,
            html: html
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            return info;
        } catch (error) {
            console.error('Error sending email: ', error);
            return false;
        }
    }
}
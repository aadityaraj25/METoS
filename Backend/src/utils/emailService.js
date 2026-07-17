import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error("Email transporter verification failed:", error.message);
  } else {
    console.log("Email server is ready");
  }
});

export const sendEmail = async ({ to, subject, html, text }) => {
  return transporter.sendMail({
    from: `"METoS" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ""),
  });
};

export const sendInviteEmail = async ({
  toEmail,
  toName,
  inviterName,
  groupName,
  inviteLink,
}) => {
  const subject = `${inviterName} invited you to join "${groupName}" on METoS`;
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>METoS Team Invite</title>
</head>
<body style="margin:0;padding:0;background-color:#0f0f1a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f1a;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.4);">
          <tr>
            <td style="background:linear-gradient(135deg,#6c63ff,#a855f7);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:32px;font-weight:800;letter-spacing:2px;">METoS</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Meet · Explore · Team · Solve</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h2 style="color:#e2e8f0;margin:0 0 8px;font-size:22px;">Hey ${toName}</h2>
              <p style="color:#94a3b8;font-size:15px;line-height:1.7;margin:0 0 24px;">
                <strong style="color:#a78bfa;">${inviterName}</strong> has invited you to join their team
                <strong style="color:#a78bfa;">"${groupName}"</strong> on METoS.
              </p>
              <div style="background:rgba(108,99,255,0.1);border:1px solid rgba(108,99,255,0.3);border-radius:12px;padding:20px;margin-bottom:32px;">
                <p style="color:#94a3b8;font-size:13px;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">Team</p>
                <p style="color:#e2e8f0;font-size:18px;font-weight:700;margin:0;">${groupName}</p>
              </div>
              <p style="color:#94a3b8;font-size:14px;margin:0 0 24px;">
                Click the button below to accept. This link is personal — valid only for
                <strong style="color:#e2e8f0;">you</strong> and expires in
                <strong style="color:#e2e8f0;">7 days</strong>.
              </p>
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${inviteLink}"
                       style="display:inline-block;background:linear-gradient(135deg,#6c63ff,#a855f7);color:#fff;text-decoration:none;font-size:16px;font-weight:700;padding:16px 48px;border-radius:50px;letter-spacing:0.5px;">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color:#64748b;font-size:12px;margin:32px 0 0;text-align:center;">
                Or paste this into your browser:<br/>
                <a href="${inviteLink}" style="color:#6c63ff;word-break:break-all;">${inviteLink}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  return sendEmail({ to: toEmail, subject, html });
};

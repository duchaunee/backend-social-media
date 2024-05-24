import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

class Util {
  async hashString(value) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(value, salt);
  }

  async compareString(value1, value2) {
    return await bcrypt.compare(value1, value2);
  }

  createJWT(userId, time) {
    return jwt.sign({ userId }, process.env.JWT_SECRET_KEY, {
      expiresIn: time,
    });
  }

  createCodeResetPassword() {
    let resetCode = "";
    for (let i = 0; i < 5; i++) {
      resetCode += Math.floor(Math.random() * 10);
    }
    return resetCode;
    // Sử dụng hàm để tạo mã code reset
  }

  templateSendVericationEmail(to, link) {
    return `
    <div
    style="background-color:white;padding:25px 15px;font-family:'Roboto',Arial,Helvetica,sans-serif">

    <div
      style="background-color:#fff;width:600px;margin:0 auto;border:1px solid #d6d6d6;padding:20px;border-radius:12px;color:black">

      <div style="font-size:16px;line-height:1.7"><span class="im">

          <h2 style="font-weight:bold;font-size:26px;color:#333;margin:0 0 15px;line-height:1.4">
            Please verify your email address
          </h2>
        </span>
        <p style="margin:0">
          This message is sent from
          <a style="color:#2879fe" href="https://www.github.com/duchaunee" target="_blank">
            dwchau
          </a>
        </p>
        <div style="max-width:700px;margin:15px auto">
          <div style="display:flex">
            <img
              src="https://ci3.googleusercontent.com/meips/ADKq_NaPIdmTlgPS-ucqe2W6TElFjPZepSfvDl6yAzhCZm58RiwLNUJeCzRaapn-tgyYpi1yDdFAjTfxtfnHi7me_X5ZhkRE7iMd5x1rw4QfoywkPy_QQiTVoIkbf7jAWRgCce7kMFzCUQ4nwnIURN9iozLlNmdEvQqSTyEBr8_3Q_v5_nX2OVaaMiR7ynqcUGJHVtjN6CBKm7bJzGr4rtrdi0NjCAI6uHeu6CkcPKyY20AdDawI-spq7mcr4vCQBk5VnCKqYXV511OP6w=s0-d-e1-ft#https://firebasestorage.googleapis.com/v0/b/shoes-shopping-web.appspot.com/o/shoesPlus-avatar%2F1682910717564avtdepnehihi.jpg?alt=media&amp;token=ff4428a9-30bb-4176-830c-3e15f3bd8d10"
              style="width:60px;height:60px;border-radius:50%;object-fit:cover" class="CToWUd"
              data-bit="iit">

            <div style="padding-left:20px">
              <h3
                style="color:#333;font-size:18px;font-weight:bold;margin-top:0;margin-bottom:5px;line-height:1">
                @dwchau
              </h3>
              <p style="font-weight:lighter;margin:0;color:#737373;font-size:16px">
                Dev at
                <a href="https://www.socialmedia.vercel.app"
                  style="color:#2879fe;font-style:italic;text-decoration:none" target="_blank">
                  socialmedia.vercel.app
                </a>
              </p>
            </div>
          </div>
          <div
            style="background-color:#eee;margin-top: 20px;border-radius:4px;line-height:1.6;font-weight:300;font-size:16px;color:#333;padding: 2px 20px 24px;">
            <p>
              Hi, <span style="color:#2879fe">${to}</span>
            </p>
            You're almost set to start enjoying SocialMedia. Simple click
            the link below to verify your email address and get started.
            <p style="color:#000;font-weight:600">
              The link expires in 1 hours!
            </p>
            <a href=${link}
              style="display:block;padding:6px 12px;background-color:#2879fe;width:fit-content;text-align:center;margin:0 auto;font-weight:400;color:#fff;border-radius:4px;text-decoration: none;"
              target="_blank"">
              Verify my email address</a>
          </div>
        </div>
      </div>
      <div style="border-top:1px solid #eee"></div>
      <p style="color:#969696;font-size:11px">
        This is an automated email, please do not reply. If you need help,
        visit <a>SocialMedia</a>, support section.
      </p>
      <div class="yj6qo"></div>
      <div class="adL">
      </div>
    </div>
    <div class="adL">
    </div>
  </div>`;
  }

  templateSendResetPassword(to, code, link) {
    return `
      <div style="margin:0;padding:0" dir="ltr" bgcolor="#ffffff">
      <table
        border="0"
        cellspacing="0"
        cellpadding="0"
        align="center"
        id="m_7040364400976230188email_table"
        style="border-collapse:collapse"
      >
        <tbody>
          <tr>
            <td
              id="m_7040364400976230188email_content"
              style="font-family:Helvetica Neue,Helvetica,Lucida Grande,tahoma,verdana,arial,sans-serif;background:#ffffff"
            >
              <table
                border="0"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                style="border-collapse:collapse"
              >
                <tbody>
                  <tr>
                    <td height="20" style="line-height:20px" colspan="3">
                      &nbsp;
                    </td>
                  </tr>
                  <tr>
                    <td height="1" colspan="3" style="line-height:1px">
                      <span style="color:#ffffff;font-size:1px;opacity:0">
                        We received a request to reset your Social Media
                        password.
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td width="15" style="display:block;width:15px">
                      &nbsp;&nbsp;&nbsp;
                    </td>
                    <td>
                      <table
                        border="0"
                        width="100%"
                        cellspacing="0"
                        cellpadding="0"
                        style="border-collapse:collapse"
                      >
                        <tbody>
                          <tr>
                            <td
                              height="15"
                              style="line-height:15px"
                              colspan="3"
                            >
                              &nbsp;
                            </td>
                          </tr>

                          <tr style="border-bottom:solid 1px #e5e5e5">
                            <td
                              height="15"
                              style="line-height:15px"
                              colspan="3"
                            >
                              &nbsp;
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                    <td width="15" style="display:block;width:15px">
                      &nbsp;&nbsp;&nbsp;
                    </td>
                  </tr>
                  <tr>
                    <td width="15" style="display:block;width:15px">
                      &nbsp;&nbsp;&nbsp;
                    </td>
                    <td>
                      <table
                        border="0"
                        width="100%"
                        cellspacing="0"
                        cellpadding="0"
                        style="border-collapse:collapse"
                      >
                        <tbody>
                          <tr>
                            <td height="4" style="line-height:4px">
                              &nbsp;
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <span
                                class="m_7040364400976230188mb_text"
                                style="font-family:Helvetica Neue,Helvetica,Lucida Grande,tahoma,verdana,arial,sans-serif;font-size:16px;line-height:21px;color:#141823"
                              >
                                <span style="font-size:15px">
                                  <p></p>
                                  <div style="margin-top:16px;margin-bottom:20px">
                                    Hi <span style="color: #2879fb">${to}</span>,
                                  </div>
                                  <div>
                                    We received a request to reset your Social Media
                                    password.
                                  </div>
                                  Enter the following password reset code:
                                  <p></p>
                                  <table
                                    border="0"
                                    cellspacing="0"
                                    cellpadding="0"
                                    style="border-collapse:collapse;width:max-content;margin-top:20px;margin-bottom:20px"
                                  >
                                    <tbody>
                                      <tr>
                                        <td style="font-size:11px;font-family:LucidaGrande,tahoma,verdana,arial,sans-serif;padding:14px 32px 14px 32px;background-color:#f2f2f2;border-left:1px solid #ccc;border-right:1px solid #ccc;border-top:1px solid #ccc;border-bottom:1px solid #ccc;text-align:center;border-radius:7px;display:block;border:1px solid #1877f2;background:#e7f3ff">
                                          <span
                                            class="m_7040364400976230188mb_text"
                                            style="font-family:Helvetica Neue,Helvetica,Lucida Grande,tahoma,verdana,arial,sans-serif;font-size:16px;line-height:21px;color:#141823"
                                          >
                                            <span style="font-size:17px;font-family:Roboto;font-weight:700;margin-left:0px;margin-right:0px">
                                              ${code}
                                            </span>
                                          </span>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  Alternatively, you can directly change your
                                  password.
                                  <table
                                    border="0"
                                    width="100%"
                                    cellspacing="0"
                                    cellpadding="0"
                                    style="border-collapse:collapse"
                                  >
                                    <tbody>
                                      <tr>
                                        <td
                                          height="20"
                                          style="line-height:20px"
                                        >
                                          &nbsp;
                                        </td>
                                      </tr>
                                      <tr>
                                        <td align="middle">
                                          <a>
                                            <table
                                              border="0"
                                              width="100%"
                                              cellspacing="0"
                                              cellpadding="0"
                                              style="border-collapse:collapse"
                                            >
                                              <tbody>
                                                <tr>
                                                  <td style="border-collapse:collapse;border-radius:6px;text-align:center;display:block;background:#1877f2;padding:8px 20px 8px 20px">
                                                    <a
                                                      href=${link}
                                                      style="color:#1b74e4;text-decoration:none;display:block"
                                                      target="_blank"
                                                    >
                                                      <center>
                                                        <font size="3">
                                                          <span style="background-color: #2879fe ; font-family:Helvetica Neue,Helvetica,Lucida Grande,tahoma,verdana,arial,sans-serif;white-space:nowrap;font-weight:bold;vertical-align:middle;color:#ffffff;font-weight:500;font-family:Roboto-Medium,Roboto,-apple-system,BlinkMacSystemFont,Helvetica Neue,Helvetica,Lucida Grande,tahoma,verdana,arial,sans-serif;font-size:17px">
                                                            Change&nbsp;Password
                                                          </span>
                                                        </font>
                                                      </center>
                                                    </a>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </a>
                                        </td>
                                      </tr>
                                      <tr>
                                        <td height="8" style="line-height:8px">
                                          &nbsp;
                                        </td>
                                      </tr>
                                      <tr>
                                        <td
                                          height="20"
                                          style="line-height:20px"
                                        >
                                          &nbsp;
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </span>
                                <div>
                                  <div></div>
                                  <div></div>
                                </div>
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                    <td width="15" style="display:block;width:15px">
                      &nbsp;&nbsp;&nbsp;
                    </td>
                  </tr>
                  <tr>
                    <td width="15" style="display:block;width:15px">
                      &nbsp;&nbsp;&nbsp;
                    </td>
                    <td>
                      <table
                        border="0"
                        width="100%"
                        cellspacing="0"
                        cellpadding="0"
                        align="left"
                        style="border-collapse:collapse"
                      >
                        <tbody>
                          <tr style="border-top:solid 1px #e5e5e5">
                            <td height="19" style="line-height:19px">
                              &nbsp;
                            </td>
                          </tr>
                          <tr>
                            <td style="font-family:Roboto-Regular,Roboto,-apple-system,BlinkMacSystemFont,Helvetica Neue,Helvetica,Lucida Grande,tahoma,verdana,arial,sans-serif;font-size:11px;color:#8a8d91;line-height:16px;font-weight:400">
                              <table
                                border="0"
                                cellspacing="0"
                                cellpadding="0"
                                style="border-collapse:collapse;color:#8a8d91;text-align:center;font-size:12px;font-weight:400;font-family:Roboto-Regular,Roboto,-apple-system,BlinkMacSystemFont,Helvetica Neue,Helvetica,Lucida Grande,tahoma,verdana,arial,sans-serif"
                              >
                                <tbody>
                                  <tr>
                                    <td
                                      align="center"
                                      style="font-size:12px;font-family:Roboto-Regular,Roboto,-apple-system,BlinkMacSystemFont,Helvetica Neue,Helvetica,Lucida Grande,tahoma,verdana,arial,sans-serif;color:#8a8d91;text-align:center;font-weight:400;padding-top:6px"
                                    >
                                      This message was sent to
                                      <a
                                        style="color:#1b74e4;text-decoration:none"
                                        href="github.com/duchaunee"
                                        target="_blank"
                                      >
                                        @dwchau
                                      </a>
                                      . <br />
                                      To help keep your account secure, please
                                      don't forward this email
                                      <a
                                        style="color:#1b74e4;text-decoration:none"
                                        target="_blank">
                                        Learn more
                                      </a>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                          <tr>
                            <td height="10" style="line-height:10px">
                              &nbsp;
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                    <td width="15" style="display:block;width:15px">
                      &nbsp;&nbsp;&nbsp;
                    </td>
                  </tr>
                  <tr>
                    <td height="20" style="line-height:20px" colspan="3">
                      &nbsp;
                    </td>
                  </tr>
                </tbody>
              </table>
              <span>
                <img
                  src="https://ci3.googleusercontent.com/meips/ADKq_NYiPKSpeLiHmL6INMPqxQm6BBtMZdJaQApdbADM1kCKoRAGXTTuZPdkBMZKubfj3AcSk-eWaoHm47SBaMhJXseCVB28G-WAMtUcz8FLaWLF4wr5Qh827l8smIZ_z6rNFRVqVPyTUhoUl9aHpk25s-8krcvca84=s0-d-e1-ft#https://www.facebook.com/email_open_log_pic.php?mid=617046ddb2b48G5af5427bef8aG61704b7712e1aG178"
                  style="border:0;width:1px;height:1px"
                  class="CToWUd"
                  data-bit="iit"
                  jslog="138226; u014N:xr6bB; 53:WzAsMl0."
                  qbzedcg37=""
                />
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
      `;
  }
}

const utils = new Util();
export default utils;

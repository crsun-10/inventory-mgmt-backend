const nodemailer = require("nodemailer");
const randomString = require("random-string");
const date = require("date-and-time");

module.exports = function(app) {
  /**
   * configuration for gmail
   * using nodemailer
   */
  var smtpTransport = nodemailer.createTransport({
    // host: 'smtp.ethereal.email',
    // port: 587,
    // secure: false, // true for 465, false for other ports
    // auth: {
    //     user: testAccount.user, // generated ethereal user
    //     pass: testAccount.pass // generated ethereal password
    // }
    service: "gmail",
    auth: {
      user: app.get("google_account").mail,
      pass: app.get("google_account").pass
    }
  });
  app.use("/send_email", {
    find(params) {
      var send_result = "sent";
      var email = params.query.email;
      var type = params.query.type;
      var receiver_type = params.query.receiver_type;
      var content = params.query.content;
      var url = params.query.url;

      var fromEmail = app.get("google_account").mail;
      var toEmails = [];
      toEmails.push(email);
      if (type == "verifyCode") {
        send_result = false;
        var verifyCode = randomString({ length: 6 });
        // var title = "Email Verify";
        var title = "Terima kasih telah mendaftar akun baru di Antara Packer!";
        // content = "Verify Code: " + verifyCode;
        content = `<p>Halo!</p>
                  <br>
                  <p>Harap gunakan kode verifikasi berikut untuk menyelesaikan proses pendaftaran akun baru anda</p>
                  <br>
                  <br>
                  <span style="padding-right: 4px">Kode verifikasi:</span>
                  <span style="padding-left: 4px">${verifyCode}</span>
                  <br>
                  <br>
                  <p>Tim Antara Packer</p>
                  <br>
                  <a href="#" style="padding-right: 4px">antarapacker.com</a>
                  <span style="padding-right: 4px">|</span><span>info@antarapacker.com</span>`;
        sendEmail(fromEmail, toEmails, title, content)
          .then(response => {
            app
              .service("/users")
              .patch(null, { isSentEmail: 1 }, { query: { email: email } });

            const verifyCodeService = app.service("/verify-codes");
            verifyCodeService
              .find({ query: { type: receiver_type, receiver: email } })
              .then(res => {
                if (res.total === 0) {
                  verifyCodeService.create({
                    type: receiver_type,
                    receiver: email,
                    verifyCode: verifyCode,
                    expired_time: date.addMinutes(new Date(), 5)
                  });
                } else {
                  verifyCodeService.patch(
                    null,
                    {
                      verifyCode: verifyCode,
                      expired_time: date.addMinutes(new Date(), 5)
                    },
                    { query: { type: receiver_type, receiver: email } }
                  );
                }
              })
              .catch(error => {});
          })
          .catch(error => {
            send_result = "error-email";
            console.log("mail error:", JSON.stringify(error));
          });
        send_result = true;
      } else if (type == "resetPassword") {
        // var title = "Reset Password";
        var title = "Lupa password anda";
        var resetToken = randomString({ length: 64 });
        // content = url + ";resetToken=" + resetToken;
        content = `<p>Halo!</p>
                  <br>
                  <p>Kami telah menerima permintaan anda untuk mengubah password. Harap klik link berikut untuk langkah selanjutnya</p>
                  <br>
                  <br>
                  <a href="${url};resetToken=${resetToken}">${url};resetToken=${resetToken}</a>
                  <br>
                  <br>
                  <p>Tim Antara Packer</p>
                  <a href="#" style="padding-right: 4px">antarapacker.com</a>
                  <span style="padding-right: 4px">|</span><span>info@antarapacker.com</span>`;
        // const userInfos = await app.service( '/users' ).patch(null, {resetToken: resetToken}, {query: {email: email}})
        sendEmail(fromEmail, toEmails, title, content)
          .then(response => {
            app.service("/users").patch(
              null,
              {
                resetToken: resetToken,
                resetExpires: date.addMinutes(new Date(), 5)
              },
              { query: { email: email } }
            );
          })
          .catch(error => {
            send_result = "error-email";
          });
      } else {
        send_result = false;
      }
      return Promise.resolve({
        send_result: send_result
      });
    }
  });

  app.use("/send-invitation-to-newstaff", {
    async find(params) {
      var email = params.query.email;
      var url = params.query.url;
      var pengdingInvitationId = params.query.pengdingInvitationId;
      var senderName = params.query.senderName;
      var senderEmail = params.query.senderEmail;
      var content = "";

      var fromEmail = senderEmail;
      var toEmails = email;
      // var title = senderName + " invited you!";
      // content = `<p></p>
      // <a href='antarapacker.herokuapp.com/authentication/accept-invitation'>Invitation</a>`;
      var title = `${senderName} mengundang anda bergabung menjadi staff!`;
      // content = `<p></p>
      // <a href='http://localhost:4200/authentication/accept-invitation'>Invitation</a>`;
      content = `<p>Halo!</p>
                <br>
                <p>${senderName} mengundang anda bergabung menjadi staff</p>
                <br>
                <p>Apa artinya buat anda jika menjadi staff ${senderName}?</p>
                <ul>
                  <li>Semua data yang anda scan melalui akun anda 
                  di aplikasi smartphone Antara Packer akan 
                  masuk ke dashboard ${senderName}</li>
                  <li>Anda tidak akan lagi dapat memasukan data 
                  yang anda scan melalui akun anda di aplikasi 
                  smartphone Antara Packer ke dashboard anda</li>
                  <li>Anda dapat berhenti menjadi staff ${senderName} 
                  dengen mengunjungi halaman pengaturan 
                  dengan akun anda di aplikasi smartphone Antara 
                  Packer</li>
                </ul>
                <br>
                <p>Jika anda bersedia menjadi staff ${senderName}, klik 
                link berikut ini untuk menerima permintaan</p>
                <br>
                <br>
                <a href="${url}">${url}</a>
                <br>
                <br>
                <p>Tim Antara Packer</p>
                <a href="#" style="padding-right: 4px">antarapacker.com</a>
                <span style="padding-right: 4px">|</span><span>info@antarapacker.com</span>`;
      sendEmail(fromEmail, toEmails, title, content)
        .then(response => {
          console.log("success sent email!!!");
        })
        .catch(error => {
          send_result = "error-email";
          console.log(
            "send-invitation-to-newstaff error:",
            JSON.stringify(error)
          );
        });
    }
  });

  app.use("/check_verify_code", {
    async find(params) {
      var verify_result = {};
      verify_result.state = false;
      verify_result.msg = "none";

      var email = params.query.email;
      var receiver_type = params.query.receiver_type;
      var verifyCode = params.query.verifyCode;

      const verifyCodeService = app.service("/verify-codes");

      const verifyCodeInfo = await verifyCodeService.find({
        query: { type: receiver_type, receiver: email, verifyCode: verifyCode }
      });

      if (verifyCodeInfo.total == 1) {
        const now = new Date();
        if (
          date.subtract(now, verifyCodeInfo.data[0].expired_time).toMinutes() <
          0
        ) {
          verify_result.state = true;
          verify_result.msg = "success";
          await app.service("users");
          if (receiver_type == "email")
            app
              .service("/users")
              .patch(null, { isVerified: 1 }, { query: { email: email } });
        } else {
          verify_result.state = false;
          verify_result.msg = "expired";
        }
      } else {
        verify_result.state = false;
        verify_result.msg = "none";
      }
      return Promise.resolve({
        result: verify_result
      });
    }
  });

  app.use("/resetYourPassword", {
    async find(params) {
      var userPassword = params.query.password;
      var resetToken = params.query.resetToken;
      const userService = app.service("users");

      var resetResult = {};
      resetResult.msg = "";
      resetResult.state = 0;

      // return user info that have token
      const getUserInfo = await userService.find({
        query: { resetToken: resetToken }
      });
      if (getUserInfo.total == 0) {
        resetResult.msg = "no token";
        resetResult.state = 2;
        return Promise.resolve({ resetResult: resetResult });
      }
      // verify expired timeout
      const now = new Date();
      if (
        date.subtract(now, getUserInfo.data[0].resetExpires).toMinutes() > 5
      ) {
        resetResult.msg = "token expired";
        resetResult.state = 3;
        return Promise.resolve({ resetResult: resetResult });
      }

      // update user info that have token
      const userInfos = await userService.patch(
        null,
        { password: userPassword },
        { query: { resetToken: resetToken } }
      );
      if (userInfos.length == 0) {
        resetResult.msg = "update password error";
        resetResult.state = 4;
        return Promise.resolve({ resetResult: resetResult });
      }
      // if success updated, clear token
      const patchUserInfo = await userService.patch(
        null,
        { resetToken: "" },
        { query: { resetToken: resetToken } }
      );
      resetResult.msg = "success";
      resetResult.state = 1;
      return Promise.resolve({ resetResult: resetResult });
    }
  });

  // app.use("/sendInvitation", {});

  async function sendEmail(fromEmail, toEmails, title, content) {
    var mailOptions = {
      from: fromEmail,
      to: toEmails,
      subject: title,
      html: content
    };
    return new Promise(function(resolve, reject) {
      smtpTransport.sendMail(mailOptions, function(error, result) {
        if (error) {
          smtpTransport.close();
          console.error("mail error:", error);
          reject(error);
        } else {
          // record email logs
          resolve(result);
        }
      });
    });
  }
};

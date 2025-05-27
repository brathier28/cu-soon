package com.browncs._final.service;

import com.sendgrid.*;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Service responsible for sending transactional emails via SendGrid. Currently used to notify
 * participants when they are invited to an event.
 */
@Service
public class EmailService {

  @Value("${SENDGRID_API_KEY}")
  private String sendGridApiKey;

  /**
   * Sends an invitation email to the specified address informing them they've been added to an
   * event.
   *
   * @param toEmail The recipient's email address
   * @param eventName The name of the event to include in the invitation
   */
  public void sendEventInvite(String toEmail, String eventName) {
    Email from = new Email("CUSoon.notifications@gmail.com");
    String subject = "You've been added to the event: " + eventName;
    Email to = new Email(toEmail);
    Content content =
        new Content(
            "text/html",
            "<!DOCTYPE html>"
                + "<html>"
                + "<head>"
                + "  <style>"
                + "    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');"
                + "    body { font-family: 'Poppins', sans-serif; background-color: #f9f9f9; padding: 20px; color: #333; }"
                + "    .container { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }"
                + "    h2 { color: #0044cc; }"
                + "    .footer { margin-top: 30px; font-size: 0.9em; color: #666; }"
                + "  </style>"
                + "</head>"
                + "<body>"
                + "  <div class='container'>"
                + "    <h2>You’ve Been Invited!</h2>"
                + "    <p>Hello,</p>"
                + "    <p>You’ve been invited to join the event: <strong>\""
                + eventName
                + "\"</strong>.</p>"
                + "    <p>Please log in to your CUSoon account to view details, RSVP, and coordinate with other attendees.</p>"
                + "    <p>Thanks for using <strong>CUSoon</strong> — a Beacon product proudly built by CognitivEdge to help you stay connected and organized.</p>"
                + "    <p>If you have any questions, feel free to contact our support team.</p>"
                + "    <p class='footer'>Best regards,<br>The CUSoon Team<br><a href='https://www.cusoon.app'>www.cusoon.app</a></p>"
                + "  </div>"
                + "</body>"
                + "</html>");
    Mail mail = new Mail(from, subject, to, content);

    SendGrid sg = new SendGrid(sendGridApiKey);
    Request request = new Request();

    try {
      request.setMethod(Method.POST);
      request.setEndpoint("mail/send");
      request.setBody(mail.build());
      Response response = sg.api(request);
      System.out.println("Email sent: Status Code = " + response.getStatusCode());
    } catch (IOException ex) {
      System.err.println("Failed to send email: " + ex.getMessage());
    }
  }
}

package notifiers;

import models.*;
import play.mvc.*;

public class Mails extends Mailer {
    public static void notification(User user) {
        setFrom("21days");
        addRecipient(user);
        setSubject("Notification");

        send(user);
    }
}

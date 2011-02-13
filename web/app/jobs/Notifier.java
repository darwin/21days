package jobs;

import models.*;
import notifiers.*;
import play.jobs.*;

// @Every("24h")
public class Notifier extends Job<Void> {
    @Override
    public void doJob() throws Exception {
        for (User user : User.findAll().toArray(new User[] {})) {
            Mails.notification(user);
        }
    }
}

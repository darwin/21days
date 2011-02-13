package jobs;

import models.*;
import notifiers.*;
import play.jobs.*;

// TODO jeden den pred zaciatkom aktivity poslat mail ze zajtra zacina
// TODO ak ma ulohu kazdych 7 dni tak dva dni po tom co mal mat splnenu
// ulohu poslat mail
//TODO ak ma ulohu kazdych 3 dni tak dva dni po tom co mal mat splnenu
//ulohu poslat mail
//TODO ak ma ulohu kazdych 7 dni tak dva dni po tom co mal mat splnenu
//ulohu poslat mail

@Every("24h")
public class Notifier extends Job<Void> {
    @Override
    public void doJob() throws Exception {
        for (User user : User.findAll().toArray(new User[] {})) {
            Mails.notification(user);
        }
    }
}

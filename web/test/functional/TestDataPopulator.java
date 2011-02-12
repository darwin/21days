package functional;

import play.jobs.*;
import play.test.*;

@OnApplicationStart
public class TestDataPopulator extends Job<Void> {
    @Override
    public void doJob() throws Exception {
        Fixtures.deleteAll();
        Fixtures.load("users.yaml");
    }
}

package functional;

import static org.hamcrest.CoreMatchers.*;
import models.*;

import org.apache.commons.lang.*;
import org.junit.*;

import play.mvc.Http.Response;
import play.test.*;

public class UsersTest extends FunctionalTest {
    @Test
    public void showsUserDetailWhenUserExists() {
        Response response = GET("/users/facebookId1");
        assertIsOk(response);
    }

    @Test
    public void showsErrorMessageWhenUserDoesntExist() {
        Response response = GET("/users/facebookId2");
        assertIsOk(response);
    }

    @Test
    public void createsUserWhenUserDoesntExist() {
        String data = StringUtils.repeat("d", 1024 * 1024);
        Response response = POST("/users/facebookId3/" + data);
        assertIsOk(response);
        assertThat(User.get("facebookId3").data, is(data));
    }

    @Test
    public void updatesUserWhenUserExists() {
        String data = "updatedData";
        Response response = POST("/users/facebookId1/" + data);
        assertIsOk(response);
        assertThat(User.get("facebookId1").data, is(data));
    }
}

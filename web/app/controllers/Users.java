package controllers;

import models.*;
import play.mvc.*;

public class Users extends Controller {
    public static void detail(String facebookId) {
        User user = User.get(facebookId);
        if (user != null) {
            renderJSON(user.data);
        }
        renderJSON(new ErrorMessage("User not found (facebookId: '"
                + facebookId + "')"));
    }

    public static void createOrUpdate(String facebookId, String data) {
        User user = User.get(facebookId);
        if (user == null) {
            user = new User(facebookId, data);
        } else {
            user.data = data;
        }
        user.save();
    }

    static class ErrorMessage {
        String errorMessage;

        ErrorMessage(String errorMessage) {
            this.errorMessage = errorMessage;
        }
    }
}

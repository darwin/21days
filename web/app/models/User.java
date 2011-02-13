package models;

import javax.persistence.*;

import play.db.jpa.*;

@Entity
public class User extends Model {
    public String facebookId;
    
    @Lob
    public String data;

    public User(String facebookId, String data) {
        this.facebookId = facebookId;
        this.data = data;
    }

    public static User get(String facebookId) {
        return User.find("facebookId", facebookId).first();
    }
}

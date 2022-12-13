package com.example.presenceqr;

import android.os.Parcel;
import android.os.Parcelable;

public class User implements Parcelable {
    private int id;
    private int userRole;
    private int facilityId;
    private String jwt;

    public User() {
        id = 0;
        userRole = 0;
        facilityId = 0;
        jwt = "";
    }

    public User(int id, int userRole, int facilityId, String jwt) {
        this.id = id;
        this.userRole = userRole;
        this.facilityId = facilityId;
        this.jwt = jwt;
    }

    protected User(Parcel in) {
        id = in.readInt();
        userRole = in.readInt();
        facilityId = in.readInt();
        jwt = in.readString();
    }

    public static final Creator<User> CREATOR = new Creator<User>() {
        @Override
        public User createFromParcel(Parcel parcel) {
            return new User(parcel);
        }

        @Override
        public User[] newArray(int i) {
            return new User[0];
        }
    };

    @Override
    public int describeContents() {
        return 0;
    }

    public int getId() {
        return id;
    }

    public int getUserRole() {
        return userRole;
    }

    public void setId(int id) {
        this.id = id;
    }

    public void setUserRole(int userRole) {
        this.userRole = userRole;
    }

    public int getFacilityId() {
        return facilityId;
    }

    public void setFacilityId(int facilityId) {
        this.facilityId = facilityId;
    }

    public String getJwt() {
        return jwt;
    }

    public void setJwt(String jwt) {
        this.jwt = jwt;
    }

    @Override
    public void writeToParcel(Parcel parcel, int i) {
        parcel.writeInt(id);
        parcel.writeInt(userRole);
        parcel.writeInt(facilityId);
        parcel.writeString(jwt);
    }
}

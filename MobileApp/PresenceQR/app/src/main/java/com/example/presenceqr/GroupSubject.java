package com.example.presenceqr;

import android.os.Parcel;
import android.os.Parcelable;

public class GroupSubject implements Parcelable {
    private String subjectName;
    private String groupName;
    private int subjectId;
    private int groupId;

    public GroupSubject(String subjectName, String groupName, int subjectId, int groupId) {
        this.subjectName = subjectName;
        this.groupName = groupName;
        this.subjectId = subjectId;
        this.groupId = groupId;
    }

    protected GroupSubject(Parcel in) {
        subjectName = in.readString();
        groupName = in.readString();
        subjectId = in.readInt();
        groupId = in.readInt();
    }

    public static final Creator<GroupSubject> CREATOR = new Creator<GroupSubject>() {
        @Override
        public GroupSubject createFromParcel(Parcel in) {
            return new GroupSubject(in);
        }

        @Override
        public GroupSubject[] newArray(int size) {
            return new GroupSubject[size];
        }
    };

    public String getSubjectName() {
        return subjectName;
    }

    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }

    public String getGroupName() {
        return groupName;
    }

    public void setGroupName(String groupName) {
        this.groupName = groupName;
    }

    public int getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(int subjectId) {
        this.subjectId = subjectId;
    }

    public int getGroupId() {
        return groupId;
    }

    public void setGroupId(int groupId) {
        this.groupId = groupId;
    }

    @Override
    public int describeContents() {
        return 0;
    }

    @Override
    public void writeToParcel(Parcel parcel, int i) {

        parcel.writeString(subjectName);
        parcel.writeString(groupName);
        parcel.writeInt(subjectId);
        parcel.writeInt(groupId);
    }
}

package com.example.presenceqr.adapters;

import android.app.Activity;
import android.content.Intent;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.presenceqr.activities.Attendance;
import com.example.presenceqr.GroupSubject;
import com.example.presenceqr.models.LecturerPresenceModel;
import com.example.presenceqr.viewholders.LecturerPresenceViewHolder;
import com.example.presenceqr.activities.LessonsList;
import com.example.presenceqr.R;
import com.example.presenceqr.User;

import java.util.List;

public class LecturerPresenceAdapter extends RecyclerView.Adapter<LecturerPresenceViewHolder> {
    private List<LecturerPresenceModel> lecturerPresenceList;
    private LayoutInflater layoutInflater;
    private Activity activity;
    private User user;
    public LecturerPresenceAdapter(Activity activity, List<LecturerPresenceModel> lecturerPresenceList, User user)
    {
        this.user = user;
        this.activity = activity;
        layoutInflater = activity.getLayoutInflater();
        this.lecturerPresenceList = lecturerPresenceList;

    }
    @NonNull
    @Override
    public LecturerPresenceViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = layoutInflater.inflate(R.layout.lecturer_presence_item, parent, false);
        return new LecturerPresenceViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull LecturerPresenceViewHolder holder, int position) {
        String subject, group;
        subject = lecturerPresenceList.get(position).getSubject();
        group = lecturerPresenceList.get(position).getGroup();
        int subjectId = lecturerPresenceList.get(position).getSubjectId(),
        groupId = lecturerPresenceList.get(position).getGroupId();
        GroupSubject groupSubject = new GroupSubject(subject, group, subjectId, groupId);
        holder.subjectTextView.setText(subject);
        holder.groupTextView.setText(group);
        holder.attendanceButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent(activity, Attendance.class);
//                intent.putExtra("subject", subject);
//                intent.putExtra("group", group);
//                intent.putExtra("subject_id", subjectId);
//                intent.putExtra("group_id", groupId);
                intent.putExtra("groupSubject", groupSubject);
                intent.putExtra("user", user);
                activity.startActivity(intent);

            }
        });
        holder.lessonsListButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {

                Intent intent = new Intent(activity, LessonsList.class);
//                intent.putExtra("subject", subject);
//                intent.putExtra("subject_id", subjectId);
//                intent.putExtra("group_id", groupId);
//                intent.putExtra("group", group);
                intent.putExtra("groupSubject", groupSubject);
                intent.putExtra("user", user);
                activity.startActivity(intent);
            }
        });
    }

    @Override
    public int getItemCount() {
        return lecturerPresenceList.size();
    }
    public void setLecturerPresenceList(List<LecturerPresenceModel> list)
    {
        lecturerPresenceList = list;
        notifyDataSetChanged();
    }
}

package com.example.presenceqr.adapters;

import android.app.Activity;
import android.content.Intent;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.presenceqr.activities.AttendanceList;
import com.example.presenceqr.GroupSubject;
import com.example.presenceqr.models.LessonsListModel;
import com.example.presenceqr.R;
import com.example.presenceqr.User;
import com.example.presenceqr.viewholders.LessonsListViewHolder;

import java.util.List;

public class LessonsListAdapter extends RecyclerView.Adapter<LessonsListViewHolder> {
    private List<LessonsListModel> lessonsList;
    private LayoutInflater layoutInflater;
    private User user;
    private GroupSubject groupSubject;
    private Activity activity;
    public LessonsListAdapter(Activity activity, List<LessonsListModel> lessonsList, User user, GroupSubject groupSubject) {
        this.activity = activity;
        layoutInflater = activity.getLayoutInflater();
        this.lessonsList = lessonsList;
        this.user = user;
        this.groupSubject = groupSubject;

    }

    @NonNull
    @Override
    public LessonsListViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = layoutInflater.inflate(R.layout.list_of_lessons_item, parent, false);
        LessonsListViewHolder lessonsListViewHolder = new LessonsListViewHolder(view);
        return lessonsListViewHolder;
    }

    @Override
    public void onBindViewHolder(@NonNull LessonsListViewHolder holder, int position) {
        holder.dateTV.setText(lessonsList.get(position).getDate());
        holder.startingHourTV.setText(lessonsList.get(position).getStartingHour());
        holder.endingHourTV.setText(lessonsList.get(position).getEndingHour());
        holder.attendanceButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                // TODO Załączyć do Intentu dane oraz rozpocząć aktywność Attendance
                Intent intent = new Intent(activity, AttendanceList.class);
                intent.putExtra("user", user);
                intent.putExtra("groupSubject", groupSubject);
                intent.putExtra("date", lessonsList.get(position).getDate());
                activity.startActivity(intent);
            }
        });
    }

    @Override
    public int getItemCount() {
        return lessonsList.size();
    }
}

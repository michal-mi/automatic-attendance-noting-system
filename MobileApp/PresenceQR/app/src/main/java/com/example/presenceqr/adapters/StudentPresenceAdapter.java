package com.example.presenceqr.adapters;

import android.app.Activity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.presenceqr.R;
import com.example.presenceqr.models.StudentPresenceModel;
import com.example.presenceqr.viewholders.StudentPresenceViewHolder;

import java.util.List;

public class StudentPresenceAdapter extends RecyclerView.Adapter<StudentPresenceViewHolder> {
    private List<StudentPresenceModel> studentPresenceList;
    private LayoutInflater layoutInflater;
    private Activity activity;

    public StudentPresenceAdapter(Activity activity, List<StudentPresenceModel> studentPresenceList) {
        this.studentPresenceList = studentPresenceList;
        this.activity = activity;
        layoutInflater = activity.getLayoutInflater();
    }

    @NonNull
    @Override
    public StudentPresenceViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = layoutInflater.inflate(R.layout.student_presence_item, parent, false);
        return new StudentPresenceViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull StudentPresenceViewHolder holder, int position) {
        String subject, begginingHour, endingHour, presenceStatus;
        subject = studentPresenceList.get(position).getSubject();
        begginingHour = studentPresenceList.get(position).getBegginingTime();
        endingHour = studentPresenceList.get(position).getEndingTime();
        presenceStatus = studentPresenceList.get(position).getPresenceStatus();
        holder.subjectTextView.setText(subject);
        holder.startHourTextView.setText(begginingHour);
        holder.endHourTextView.setText(endingHour);
        holder.statusTextView.setText(presenceStatus);
    }

    @Override
    public int getItemCount() {
        return studentPresenceList.size();
    }
}

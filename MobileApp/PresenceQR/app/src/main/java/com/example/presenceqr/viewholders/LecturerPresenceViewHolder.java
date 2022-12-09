package com.example.presenceqr.viewholders;

import android.view.View;
import android.widget.Button;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.presenceqr.R;

public class LecturerPresenceViewHolder extends RecyclerView.ViewHolder {
    public final TextView subjectTextView, groupTextView;
    public final Button lessonsListButton, attendanceButton;
    public LecturerPresenceViewHolder(@NonNull View itemView) {
        super(itemView);
        subjectTextView = itemView.findViewById(R.id.lecturer_presence_subject);
        groupTextView = itemView.findViewById(R.id.lecturer_presence_group);
        lessonsListButton = (Button) itemView.findViewById(R.id.lecturer_presence_lessons_button);
        attendanceButton = (Button) itemView.findViewById(R.id.lecturer_presence_attendance_button);
    }
}

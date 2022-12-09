package com.example.presenceqr.viewholders;

import android.view.View;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.presenceqr.R;

public class StudentPresenceViewHolder extends RecyclerView.ViewHolder {
    public final TextView subjectTextView, startHourTextView, endHourTextView, statusTextView;

    public StudentPresenceViewHolder(@NonNull View itemView) {
        super(itemView);
        subjectTextView = itemView.findViewById(R.id.subject_text_view);
        startHourTextView = itemView.findViewById(R.id.beggining_hour);
        endHourTextView = itemView.findViewById(R.id.ending_hour);
        statusTextView = itemView.findViewById(R.id.presence_status);
    }
}

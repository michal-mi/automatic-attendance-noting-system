package com.example.presenceqr.viewholders;

import android.view.View;
import android.widget.Button;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.presenceqr.R;

public class LessonsListViewHolder extends RecyclerView.ViewHolder {
    public final TextView dateTV, startingHourTV, endingHourTV;
    public final Button attendanceButton;
    public LessonsListViewHolder(@NonNull View itemView) {
        super(itemView);
        dateTV = itemView.findViewById(R.id.date_tv);
        startingHourTV = itemView.findViewById(R.id.start_hour_tv);
        endingHourTV = itemView.findViewById(R.id.end_hour_tv);
        attendanceButton = (Button) itemView.findViewById(R.id.attendance_list_button);
    }
}

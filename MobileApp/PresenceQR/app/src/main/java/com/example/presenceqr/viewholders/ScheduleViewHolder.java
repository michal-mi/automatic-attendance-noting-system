package com.example.presenceqr.viewholders;

import android.view.View;
import android.widget.Button;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.example.presenceqr.R;
public class ScheduleViewHolder extends RecyclerView.ViewHolder {
    public final TextView hourTV;
    public final Button mondayButton, tuesdayButton, wednesdayButton, thursdayButton, fridayButton, saturdayButton, sundayButton;

    public ScheduleViewHolder(@NonNull View itemView) {
        super(itemView);
        hourTV = itemView.findViewById(R.id.hour_tv);
        mondayButton = itemView.findViewById(R.id.monday_square);
        tuesdayButton = itemView.findViewById(R.id.tuesday_square);
        wednesdayButton = itemView.findViewById(R.id.wednesday_square);
        thursdayButton = itemView.findViewById(R.id.thursday_square);
        fridayButton = itemView.findViewById(R.id.friday_square);
        saturdayButton = itemView.findViewById(R.id.saturday_square);
        sundayButton = itemView.findViewById(R.id.sunday_square);
    }
}

package com.example.presenceqr.viewholders;

import android.view.View;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.presenceqr.R;

public class AttendanceViewHolder  extends RecyclerView.ViewHolder {
    public final TextView surnameTextView, nameTextView, idTextView, attendanceTextView;

    public AttendanceViewHolder(@NonNull View itemView) {
        super(itemView);
        surnameTextView = itemView.findViewById(R.id.attendance_surname);
        nameTextView = itemView.findViewById(R.id.attendance_name);
        idTextView = itemView.findViewById(R.id.attendance_id);
        attendanceTextView = itemView.findViewById(R.id.attendance_value);
    }

}

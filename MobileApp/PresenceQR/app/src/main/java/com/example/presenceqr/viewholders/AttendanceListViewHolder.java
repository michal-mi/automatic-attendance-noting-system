package com.example.presenceqr.viewholders;

import android.view.View;
import android.widget.Spinner;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.presenceqr.R;

public class AttendanceListViewHolder extends RecyclerView.ViewHolder {
    public TextView surnameTV, nameTV, idTV;
    public Spinner statusSpinner;
    public AttendanceListViewHolder(@NonNull View itemView) {
        super(itemView);
        surnameTV = itemView.findViewById(R.id.attendance_list_surname);
        nameTV = itemView.findViewById(R.id.attendance_list_name);
        idTV = itemView.findViewById(R.id.attendance_list_id);
        statusSpinner = (Spinner) itemView.findViewById(R.id.attendance_list_status);

    }
}

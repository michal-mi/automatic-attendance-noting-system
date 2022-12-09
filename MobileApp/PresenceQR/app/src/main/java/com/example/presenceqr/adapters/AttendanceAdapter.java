package com.example.presenceqr.adapters;

import android.app.Activity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.presenceqr.viewholders.AttendanceViewHolder;
import com.example.presenceqr.R;
import com.example.presenceqr.models.AttendanceModel;

import java.util.List;

public class AttendanceAdapter extends RecyclerView.Adapter<AttendanceViewHolder> {
    private List<AttendanceModel> attendanceList;
    private LayoutInflater layoutInflater;
    public AttendanceAdapter(Activity activity, List<AttendanceModel> attendanceList)
    {
        layoutInflater = activity.getLayoutInflater();
        this.attendanceList = attendanceList;
    }
    @NonNull
    @Override
    public AttendanceViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = layoutInflater.inflate(R.layout.attendance_item, parent, false);
        AttendanceViewHolder attendanceViewHolder = new AttendanceViewHolder(view);
        return attendanceViewHolder;
    }

    @Override
    public void onBindViewHolder(@NonNull AttendanceViewHolder holder, int position) {
        holder.surnameTextView.setText(attendanceList.get(position).getSurname());
        holder.nameTextView.setText(attendanceList.get(position).getName());
        String idText = Integer.toString(attendanceList.get(position).getId());
        holder.idTextView.setText(idText);
        String attendanceText = Double.toString(attendanceList.get(position).getAttendance());
        holder.attendanceTextView.setText(attendanceText);
    }

    @Override
    public int getItemCount() {
        return attendanceList.size();
    }

}

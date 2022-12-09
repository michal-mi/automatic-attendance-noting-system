package com.example.presenceqr.adapters;

import android.app.Activity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.presenceqr.viewholders.AttendanceListViewHolder;
import com.example.presenceqr.R;
import com.example.presenceqr.models.AttendanceListModel;

import java.util.List;

public class AttendanceListAdapter extends RecyclerView.Adapter<AttendanceListViewHolder> {
    private final List<AttendanceListModel> attendanceListList;
    private final LayoutInflater layoutInflater;

    public AttendanceListAdapter(Activity activity, List<AttendanceListModel> attendanceListList)
    {
        layoutInflater = activity.getLayoutInflater();
        this.attendanceListList = attendanceListList;

    }

    @NonNull
    @Override
    public AttendanceListViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = layoutInflater.inflate(R.layout.attendance_list_item, parent, false);
        return new AttendanceListViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull AttendanceListViewHolder holder, int position) {
        holder.surnameTV.setText(attendanceListList.get(position).getSurname());
        holder.nameTV.setText(attendanceListList.get(position).getName());
        holder.idTV.setText(attendanceListList.get(position).getId());
        holder.statusSpinner.setSelection(attendanceListList.get(position).getAttendanceStatus()-1);
        holder.statusSpinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> adapterView, View view, int pos, long id) {
                attendanceListList.get(holder.getAdapterPosition()).setAttendanceStatus(pos+1);
                //Log.v("attstatus:", Integer.toString(attendanceListList.get(position).getAttendanceStatus()));
            }

            @Override
            public void onNothingSelected(AdapterView<?> adapterView) {

            }
        });
    }

    @Override
    public int getItemCount() {
        return attendanceListList.size();
    }
}

package com.example.presenceqr.adapters;

import android.app.Activity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.presenceqr.R;
import com.example.presenceqr.models.ScheduleModel;
import com.example.presenceqr.models.User;
import com.example.presenceqr.viewholders.ScheduleViewHolder;

import java.util.List;
public class ScheduleAdapter extends RecyclerView.Adapter<ScheduleViewHolder> {
    private List<ScheduleModel> scheduleList;
    private LayoutInflater layoutInflater;
    private Activity activity;
    private User user;

    public ScheduleAdapter(Activity activity, List<ScheduleModel> scheduleList) {
        this.activity = activity;
        this.scheduleList = scheduleList;
    }

    @NonNull
    @Override
    public ScheduleViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = layoutInflater.inflate(R.layout.schedule_item, parent, false);
        return new ScheduleViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ScheduleViewHolder holder, int position) {
        for(int i=0;i<7;i++) {
            Button dayButton = getButtonFromDay(holder, i);
            if (scheduleList.get(position).getClassInfoArrayAt(i) != null) {
                //dayButton.setBackgroundColor(Color.parseColor("#FF5722"));
                dayButton.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View view) {
                        //TODO start ClassDetails activity and add needed info
                    }
                });
            }
            else{
                dayButton.setVisibility(View.GONE);
                dayButton.setClickable(false);
            }
        }
    }

    private Button getButtonFromDay(ScheduleViewHolder holder, int day){
        Button button;
        switch(day) {
            case 0:
                button = holder.mondayButton;
                break;
            case 1:
                button = holder.tuesdayButton;
                break;
            case 2:
                button = holder.wednesdayButton;
                break;
            case 3:
                button = holder.thursdayButton;
                break;
            case 4:
                button = holder.fridayButton;
                break;
            case 5:
                button = holder.saturdayButton;
                break;
            case 6:
                button = holder.sundayButton;
                break;
            default:
                button = null;
        }
        return button;
    }

    @Override
    public int getItemCount() {
        return scheduleList.size();
    }
}
